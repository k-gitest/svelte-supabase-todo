<script lang="ts">
  import { fullToaster } from '../store/toast';

  type FullToaster = {
    isActive: boolean;
    message: string;
    class: string;
  }
  
  let toaster = {
    isActive: false,
    message: '',
    class: 'info'
  }

  $: {
    toaster = $fullToaster as FullToaster
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