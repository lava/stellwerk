<script lang="ts">
  import type { PageData } from "./$types";
  import { onMount } from "svelte";
  import VoteNotification from "$lib/components/VoteNotification.svelte";
  import StreamSwitchCountdown from "$lib/components/StreamSwitchCountdown.svelte";

  let { data }: { data: PageData } = $props();

  let streamUrl: string | undefined = $state(data.stream_url);

  // Stream switch countdown state
  let showCountdown = $state(false);
  let countdownStream = $state("");
  let pendingStreamUrl: string | null = null;

  // Vote notifications state
  interface NotificationItem {
    id: string;
    streamTitle: string;
  }
  let notifications = $state<NotificationItem[]>([]);
  let notificationCounter = 0;

  // Track seen votes to prevent duplicates
  let seenVoteTimestamps = new Set<number>();
  let lastStreamId: string | null = null;
  let lastPollTime = Date.now();

  function addNotification(streamTitle: string) {
    const id = `vote-${notificationCounter++}`;
    notifications = [...notifications, { id, streamTitle }];
  }

  function dismissNotification(id: string) {
    notifications = notifications.filter((n) => n.id !== id);
  }

  let iframeElement: HTMLIFrameElement;
  let containerElement: HTMLDivElement;

  const DEFAULT_STREAM_URL =
    "https://streaming.media.ccc.de/39c3/embed/infobeamer/hls/native";

  onMount(() => {
    const updateIframeSize = () => {
      if (iframeElement) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        iframeElement.style.width = `${vw}px`;
        iframeElement.style.height = `${vh}px`;
      }
    };
    updateIframeSize();
    window.addEventListener("resize", updateIframeSize);

    //request fullscreen
    containerElement.requestFullscreen?.().catch((err) => {
      console.warn("Fullscreen request failed:", err);
    });

    async function fetchData() {
      const res = await fetch(`/api/player-update?since=${lastPollTime}`);
      const response_data = await res.json();

      const newStreamUrl = response_data.stream_url ?? DEFAULT_STREAM_URL;

      // Show notifications for new votes
      for (const vote of response_data.recent_votes ?? []) {
        if (!seenVoteTimestamps.has(vote.timestamp)) {
          seenVoteTimestamps.add(vote.timestamp);
          addNotification(vote.streamTitle);
        }
      }

      // Trigger countdown if winning stream changed
      if (lastStreamId && response_data.stream_id && response_data.stream_id !== lastStreamId && !showCountdown) {
        countdownStream = response_data.stream_title;
        pendingStreamUrl = newStreamUrl;
        showCountdown = true;
      } else if (!showCountdown) {
        // Only update stream URL immediately if not showing countdown
        streamUrl = newStreamUrl;
      }

      lastStreamId = response_data.stream_id;
      lastPollTime = Date.now();
    }

    const interval = setInterval(fetchData, 1000);
    fetchData();

    return () => {
      clearInterval(interval);
    };
  });
</script>

<div class="center" bind:this={containerElement}>
  <iframe
    bind:this={iframeElement}
    title="Current Stream"
    src={streamUrl}
    width="100%"
    height="100%"
    frameborder="none"
    allowfullscreen
    seamless
    scrolling="no"
  >
  </iframe>

  <!-- Notification overlay -->
  <div class="notifications-container">
    {#each notifications as notification (notification.id)}
      <VoteNotification
        streamTitle={notification.streamTitle}
        onDismiss={() => dismissNotification(notification.id)}
      />
    {/each}
  </div>

  <!-- Stream switch countdown -->
  {#if showCountdown}
    <StreamSwitchCountdown
      streamTitle={countdownStream}
      onComplete={() => {
        if (pendingStreamUrl) {
          streamUrl = pendingStreamUrl;
          pendingStreamUrl = null;
        }
        showCountdown = false;
      }}
    />
  {/if}
</div>

<style>
  .center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    position: relative;
  }
  .center iframe {
    border: none;
  }

  .notifications-container {
    position: fixed;
    top: 1.5rem;
    right: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    z-index: 1000;
    pointer-events: none;
  }

  .notifications-container :global(.notification) {
    pointer-events: auto;
  }
</style>
