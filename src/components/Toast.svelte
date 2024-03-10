<script lang="ts">
  import { fullToaster } from '../store/toast';

  let toaster
  
  $: {
    toaster = $fullToaster
  }
</script>

{#if toaster.isActive}
  <div class="toast">
    <div class="alert" 
      class:alert-success={toaster.class === 'success'} 
      class:alert-info={toaster.class === 'info'}
      >
      <span class="text-sm">{toaster.message}</span>
    </div>
  </div>
{/if}