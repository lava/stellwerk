<script lang="ts">
  interface Props {
    streamTitle: string;
    seconds?: number;
    onComplete?: () => void;
  }

  let { streamTitle, seconds = 5, onComplete }: Props = $props();

  let remaining = $state(seconds);

  $effect(() => {
    const interval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  });
</script>

<div class="countdown-overlay">
  <div class="countdown-content">
    Switching to <span class="stream-title">{streamTitle}</span> in {remaining}s
  </div>
</div>

<style>
  .countdown-overlay {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 33vh;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-out;
  }

  .countdown-content {
    color: white;
    font-family: var(--font-body, sans-serif);
    font-size: 4rem;
    font-weight: 800;
  }

  .stream-title {
    font-weight: 800;
    color: var(--color-text-main, #ff5053);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
