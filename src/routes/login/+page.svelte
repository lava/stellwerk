<script lang="ts">
</script>

<svelte:head>
  <title>Login</title>
  <meta name="description" content="Login to the app" />
</svelte:head>

<div class="container">
  <div class="breadcrumbs">LOGIN</div>
  <div class="box">
    <h2>WHO ARE YOU?</h2>

    <form action="?/login" method="post">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name" />
      <button type="submit">Submit</button>
    </form>
  </div>
</div>

<style>
  .container {
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .box {
    padding: 16px;
    border: 1px solid var(--color-border);
  }

  .breadcrumbs {
    font-size: 0.75rem;
  }
</style>
