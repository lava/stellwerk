<script lang="ts">
  import type { PageData } from "./$types";
  import type { Stream } from "$lib/voting-machine";
  import { formatDistanceToNow } from "date-fns";
  import { onMount } from "svelte";
  import { invalidateAll } from "$app/navigation";
  let { data }: { data: PageData } = $props();

  let selectedStream = $state<Stream>();

  onMount(() => {
    const interval = setInterval(() => {
      invalidateAll();
    }, 5000);
    return () => clearInterval(interval);
  });
</script>

<div class="app">
  <h1>Votes</h1>

  <h2>Live</h2>
  <div class="radio-group">
    {#each data.liveStreams as stream}
      <form
        method="POST"
        action="?/vote"
        onchange={(e) => e.currentTarget.requestSubmit()}
      >
        <input type="hidden" name="choice" value={stream.id} />
        <div class="radio-panel">
          <input
            type="checkbox"
            name="selected"
            id={stream.id}
            checked={data.votes.includes(stream.id) ?? undefined}
          />
          <label for={stream.id}>
            <div>
              {stream.title}
              <span
                onclick={(e) => {
                  selectedStream = stream;
                  e.preventDefault();
                }}
                class="info-button"
              >
                🛈
              </span>
            </div>

            <span class="checkmark"
              >{Array(stream.votes ?? 0)
                .fill("✓")
                .join("")}</span
            >
          </label>
        </div>
      </form>
    {/each}
  </div>

  <h2>Upcoming</h2>
  <div class="radio-group">
    {#each data.upcomingStreams as stream}
      <form
        method="POST"
        action="?/vote"
        onchange={(e) => e.currentTarget.requestSubmit()}
      >
        <input type="hidden" name="choice" value={stream.id} />
        <div class="radio-panel">
          <input
            type="checkbox"
            name="selected"
            id={stream.id}
            checked={data.votes.includes(stream.id) ?? undefined}
          />
          <label for={stream.id}>
            <span>
              {stream.title}
              <span
                onclick={(e) => {
                  selectedStream = stream;
                  e.preventDefault();
                }}
                class="info-button"
              >
                🛈
              </span>
            </span>
            <div class="panel-footer">
              <div class="until-start-text">
                Starts in {formatDistanceToNow(stream.start_date)}
              </div>
              <div class="checkmark">
                {Array(stream.votes ?? 0)
                  .fill("✓")
                  .join("")}
              </div>
            </div>
          </label>
        </div>
      </form>
    {/each}
  </div>

  {#if selectedStream}
    <div class="overlay" onclick={() => (selectedStream = undefined)}>
      <div class="stream-dialog">
        <h2>
          {selectedStream?.title}
        </h2>
        <div class="description">
          {selectedStream?.description}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  h1 {
    color: var(--color-text-main);
    font-size: 2rem;
    margin: 1rem;
  }

  h2 {
    color: var(--color-text-main);
    font-size: 1.5rem;
    margin: 1rem;
  }

  .radio-group {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .radio-panel {
    width: 320px;
    height: 180px;
    cursor: pointer;
    font-size: 1.25rem;
    text-align: left;
    overflow: hidden;
  }
  .radio-panel input {
    display: none;
  }
  .radio-panel label {
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    border: 2px solid var(--color-text-main);
    box-sizing: border-box;
    padding: 0.5rem 1rem;
    /* font-weight: 700; */
  }
  .radio-panel .checkmark {
    font-size: 1.5rem;
    text-align: right;
    color: var(--color-text-main);
  }
  .radio-panel .panel-footer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: end;
  }
  .radio-panel .until-start-text {
    font-size: 1rem;
    text-align: right;
  }
  .radio-panel input:checked + label {
    color: var(--color-active);
    border-color: var(--color-active);
  }
  .radio-panel input:checked + label .checkmark {
    color: var(--color-active);
  }

  .app {
    display: flex;
    flex-direction: column;
    background-color: black;
    height: 100%;
    width: 100%;
    overflow: auto;
    color: var(--color-text-main);
    padding: 1.5rem;
    box-sizing: border-box;
  }

  .overlay {
    position: fixed;
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .stream-dialog {
    padding: 16px;
    border: 1px solid var(--color-border);
    background-color: black;
    min-width: 320px;
    min-height: 180px;
    max-width: 80vw;
    max-height: 80vh;
  }

  .stream-dialog .description {
    white-space: pre-line;
  }

  .info-button {
    cursor: pointer;
  }
</style>
