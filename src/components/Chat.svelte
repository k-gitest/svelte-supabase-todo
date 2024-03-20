<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import { supabase } from '@/lib/supabase'
  import type { RealtimePostgresChangesPayload } from '@supabase/realtime-js'
  import { userId } from '@/store/user';
  import { toaster } from '@/store/toast';
  import ChatRoomCreate from '@/components/ChatRoomCreate.svelte'
  import ChatRoomSelect from '@/components/ChatRoomSelect.svelte'
  import { roomId, roomName } from '@/store/room';

  type Message = {
    id: string;
    uid: string;
    text: string;
    created_At: string;
  }
  
  let uid: string | null = null;
  let messages: Message[] = [];
  let selectRoom: string | null = null
  let users: string[] = []
  let is_disable = true
  let scrollContainer: HTMLElement | null = null;

  $: {
    uid = $userId;
    if(uid)is_disable = false
  }

  const fetchMessages = async () => {
    selectRoom = $roomId
    if(selectRoom){
      const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .eq('room_id', selectRoom);

      if (error) {
        console.error('接続できませんでした', error.message);
      } else {
        messages = data;
      }
    }
    
  };

  const messageListener = (payload: RealtimePostgresChangesPayload<Message>) => {
    if(payload.errors) console.error("payload error", payload.errors)
    if (payload.eventType === 'INSERT') {
      messages = [...messages, payload.new];
    }
  };

  const sendMessage = async (event: SubmitEvent) => {
    event.preventDefault();
    is_disable = true
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

  const scrollToBottom = () => {
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }

  onMount(async () => {
    await fetchMessages();
    
    await supabase.channel("roomone")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        messageListener
      )
      .subscribe();
  });

  onDestroy(async() => {
      await supabase.channel("roomone").unsubscribe()
  });

  afterUpdate(() => {
    scrollToBottom()
  });

</script>

<div class="flex gap-5 justify-center">
  
  <div class="flex flex-col gap-2 w-96">
    <ChatRoomCreate />
    <ChatRoomSelect {fetchMessages} />
  </div>

  <div class="flex flex-col items-center gap-2">
    <div>
      {#if $roomName}
        <p>{$roomName}</p>
      {:else}
        <p>roomを選択してください</p>
      {/if}
    </div>
    <div class="w-96 h-96 overflow-x-auto" bind:this={scrollContainer}>
      {#each messages as message}
        {#if message.uid === uid}
          <div class="chat chat-start">
            <div class="chat-bubble break-words text-left">{message.text}</div>
          </div>
        {:else}
          <div class="chat chat-end">
            <div class="chat-bubble">{message.text}</div>
          </div>
        {/if}
      {/each}
    </div>
  
    <div class="w-96">
      <form on:submit={sendMessage} id="chatForm">
        <div class="flex gap-2 justify-center">
          <input type="text" name="text" class="input input-bordered w-full max-w-xs" placeholder="メッセージを入力してください" />
        <button type="submit" class="btn btn-square" disabled={is_disable}>Send</button>
        </div>
      </form>
    </div>
  </div>

</div>