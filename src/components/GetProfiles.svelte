<script lang="ts" context="module">
  import { onMount } from 'svelte';
  import { supabase } from '@/lib/supabase'
  import type { Profile } from '@/types/supabase'

  let users: Profile[] = []

  export const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('username', {ascending: true})
    if(error)console.error('接続できませんでした', error.message)
    return users = data ?? [];
  }

  export const getUserName = (memberId: string) => {
    const user = users.find(user => user.id === memberId)
    return user ? user.username : null;
  }
</script>


  