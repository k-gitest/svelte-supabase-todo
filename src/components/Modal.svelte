<script lang="ts">
  export let modalId: string | null = null
</script>

<dialog id={modalId} class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <slot />
    <div class="modal-action">
      <form method="dialog">
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>
