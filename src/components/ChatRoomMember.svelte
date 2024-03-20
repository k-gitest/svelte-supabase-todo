<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '@/lib/supabase'
  import { userId } from '@/store/user';
  import { toaster } from '@/store/toast';
  import { roomId, roomName } from '@/store/room';

  export let uid: string | null = null;
  let messages: Message[] = [];
  let members: string[] = []
  let users: string[] = []
  let is_disable = true

  $: {
    uid = $userId;
    if(uid)is_disable = false
  }

  const fetchMembers = async () => {
    const { data, error } = await supabase.from('members').select('*').order('uid', { acending: true})

    if (error) {
      console.error('接続できませんでした', error.message);
    } else {
      members = data.filter(room => {
        if(room.room_id === $roomId) room.uid
      })
      
    }
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('username', {acending: true})
    if(error)console.error('接続できませんでした', error.message)
    users = data
  }

  onMount(async () => {
    await fetchMembers()
    await fetchUsers()
  });

</script>

<div class="flex flex-col items-center gap-2 w-96">
  {#if members.length > 0}
  <ul>
    {#each members as member}
      <li>{member.uid}</li>
    {/each}
  </ul>
  {:else}
    <p>メンバーは設定されていません</p>
  {/if}
  <div class="w-full">
    {#if users.length > 0}
      {#each users as user}
        <label class="label cursor-pointer">
          <span class="label-text">{user.username}</span> 
          <input type="checkbox" value={user.id} class="checkbox" />
        </label>
      {/each}
    {:else}
      <span class="loading loading-spinner loading-lg"></span>
    {/if}
  </div>
</div>
