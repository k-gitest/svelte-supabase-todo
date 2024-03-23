<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '@/lib/supabase'
  import { userId } from '@/store/user';
  import { toaster } from '@/store/toast';
  import { roomId, roomName } from '@/store/room';
  import { member_submit_disable } from '@/store/member';

  let uid: string | null = null;
  let selectRoom: string | null = null
  let is_disable = true
  let member_disable: string | null = null

  $: {
    uid = $userId;
    if(uid){
      is_disable = false
    }
    selectRoom = $roomId
    member_disable = $member_submit_disable
    if(selectRoom || member_disable) checkRoomMember()
  }

  const sendMessage = async (event: SubmitEvent) => {
    event.preventDefault();
    is_disable = true
    selectRoom = $roomId
    try{
      const formData = new FormData(event.target as HTMLFormElement);
      const text = formData.get('text') as string;

      const { error } = await supabase.from('messages').insert([
        { text, uid, room_id: selectRoom },
      ]);

      toaster.set({isActive: true, message: '投稿完了！', class: 'success'})
      const formElement = document.getElementById("chatForm") as HTMLFormElement | null;
      if (formElement) {
          formElement.reset();
      }

      is_disable = false
    }
    catch(error: any){
      console.error('送信できませんでした', error.message);
      toaster.set({isActive: true, message: '送信できませんでした'})
    }
    finally{
      setTimeout(() => {
        toaster.set({isActive: false});
      }, 3000);
    }
  };

  const checkRoomMember = async () => {
    const { data, error } = await supabase.from("members").select("*").eq("room_id", selectRoom).eq("uid", uid)
    if(error) console.error(error.message)
    if(data?.length === 0) is_disable = true
    member_submit_disable.set(null)
  }

</script>

<div class="w-96">
  <form on:submit={sendMessage} id="chatForm">
    <div class="flex gap-2 justify-center">
      <input type="text" name="text" class="input input-bordered w-full max-w-xs" placeholder="メッセージを入力してください" disabled={is_disable} />
    <button type="submit" class="btn btn-square" disabled={is_disable}>Send</button>
    </div>
  </form>
</div>

