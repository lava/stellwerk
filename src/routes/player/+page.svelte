<script lang="ts">
  import type { PageData } from "./$types";
  import { onMount } from "svelte";

  let { data }: { data: PageData } = $props();

  let streamUrl: string | undefined = $state(data.stream_url);

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
      const res = await fetch("/api/player-update");
      const response_data = await res.json();
      streamUrl = response_data.stream_url ?? DEFAULT_STREAM_URL;
    }

    const interval = setInterval(fetchData, 1000);
    fetchData();

    return () => clearInterval(interval);
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
</div>

<style>
  .center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
  }
  .center iframe {
    border: none;
  }
</style>
