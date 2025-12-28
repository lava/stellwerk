<script lang="ts">
  interface Props {
    streamTitle: string;
    onDismiss?: () => void;
  }

  let { streamTitle, onDismiss }: Props = $props();

  // Auto-dismiss after 4 seconds
  $effect(() => {
    if (onDismiss) {
      const timeout = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timeout);
    }
  });

</script>

<div class="notification" role="alert">
  <div class="notification-content">
    <span class="action">Vote for</span>
    <span class="stream-title">{streamTitle}</span>
  </div>
</div>

<style>
  .notification {
    position: relative;
    background: rgba(0, 0, 0, 0.85);
    border: 2px solid var(--color-text-main, #ff5053);
    border-radius: 8px;
    padding: 1rem 1.5rem;
    color: white;
    font-family: var(--font-body, sans-serif);
    animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-in 3.7s forwards;
    max-width: 400px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }

  .notification-content {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    align-items: baseline;
  }

  .action {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.95rem;
  }

  .stream-title {
    font-weight: 600;
    color: var(--color-text-main, #ff5053);
    font-size: 1.1rem;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
</style>
