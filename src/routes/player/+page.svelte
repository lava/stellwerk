<script lang="ts">
  import type { PageData } from "./$types";
  import { onMount } from "svelte";

  let { data }: { data: PageData } = $props();

  let streamUrl: string | undefined = $state(data.stream_url);

  const DEFAULT_STREAM_URL =
    "https://streaming.media.ccc.de/39c3/embed/infobeamer/hls/native";

  onMount(() => {
    async function fetchData() {
      const res = await fetch("/api/player-update");
      const response_data = await res.json();
      streamUrl = response_data.stream_url ?? DEFAULT_STREAM_URL;
    }

    const interval = setInterval(fetchData, 5000);
    fetchData();

    return () => clearInterval(interval);
  });
</script>

<div class="center">
  <div class="stream-panel">
    <iframe
      title="Current Stream"
      src={streamUrl}
      width="1024"
      height="576"
      frameborder="none"
      allowfullscreen
      seamless
      scrolling="no"
    >
    </iframe>
  </div>
</div>

<style>
  .center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
</style>
