<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '@/lib/supabase'
  import { userId } from '@/store/user';
  import { toaster } from '@/store/toast';
  import { roomId, roomName } from '@/store/room';
  import { member_roomId, member_roomName } from '@/store/member';
  import type { Profile } from '@/types/supabase'
  import type { Member } from '@/types/supabase'

  let members: Member[] = []
  let users: Profile[] = []
  let modalId = 'member_select'
  let roomMember: string | null = null;
  $:{
    roomMember = $member_roomId
    if(roomMember){
        fetchMembers()
      }
  }

  const fetchMembers = async () => {
    const { data, error } = await supabase.from('members').select('*').order('uid', { ascending: true})

    if (error) {
      console.error('接続できませんでした', error.message);
    } 
    else {
      members = data.filter(member => {
        if(member.room_id === roomMember) return member
      })
    }
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('username', {ascending: true})
    if(error)console.error('接続できませんでした', error.message)
    users = data ?? [];
  }

  onMount(async () => {
    await fetchMembers()
    await fetchUsers()
  });

  const handleMemberChange = async (event: Event) => {
    const { checked: isChecked, value: uid } = event.target as HTMLInputElement;
    const room_id = $member_roomId;

    if(isChecked){
      const { data, error } = await supabase.from('members').insert({uid, room_id})
      if(error) console.error(error.message)
      fetchMembers()
    } 
    else {
      members = members.filter(member => member.uid !== uid)
    }
  }

  const handleMemberCancel = async (memberId: string, roomId: string | null) => {
    const { data, error } = await supabase.from('members').delete().eq("uid", memberId).eq("room_id", roomId)

    if(error) console.error(error.message)
    fetchMembers()
  }

</script>

<div class="flex flex-col justify-center items-center gap-2 w-full">
  <div class="w-full">
  <h3 class="font-bold text-lg">{$member_roomName}のMember</h3>
  {#if members.length > 0}
  <ul>
    {#each members as member}
      <li class="flex justify-between items-center">
        <div class="avatar placeholder">
          <div class="bg-neutral text-neutral-content rounded-full w-12">
            <span>UI</span>
          </div>
        </div>
        {member.uid}
        <button class="btn btn-square btn-sm" on:click={() => handleMemberCancel(member.uid, roomMember)}>×</button>
      </li>
    {/each}
  </ul>
  {:else}
    <p class="py-4">Memberは設定されていません</p>
  {/if}

  <p class="py-4">{$member_roomName}のMemberを設定する</p>
  {#if users.length > 0}
    <div class="mb-2">
    {#each users as user}
      <label class="label cursor-pointer">
        <div class="avatar placeholder">
          <div class="bg-neutral text-neutral-content rounded-full w-8">
            <span class="text-xs">UI</span>
          </div>
        </div>
        <span class="label-text">{user.username}</span> 
        <input type="checkbox" on:change={handleMemberChange} value={user.id} class="checkbox" checked={members.some(member => member.uid === user.id && member.room_id === roomMember)} disabled={members.some(member => member.uid === user.id && member.room_id === roomMember)} />
      </label>
    {/each}
    </div>
  {:else}
    <span class="loading loading-spinner loading-lg"></span>
  {/if}
  </div>
</div>
