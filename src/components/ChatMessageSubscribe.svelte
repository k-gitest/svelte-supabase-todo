<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '@/lib/supabase'
  import type { RealtimePostgresChangesPayload } from '@supabase/realtime-js'
  import { roomId, roomName } from '@/store/room';
  import type { Message } from '@/types/supabase'

  export let messageListener: (payload: RealtimePostgresChangesPayload<Message>) => void;

  onMount(async () => {
    await supabase.channel("roomone").on("postgres_changes", { event: "*", schema: "public", table: "messages" }, messageListener).subscribe();
  });

  onDestroy(async() => {
    await supabase.channel("roomone").unsubscribe()
  });

</script>
