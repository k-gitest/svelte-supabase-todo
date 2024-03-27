<script lang="ts">
  import { onMount, afterUpdate } from "svelte";
  import { supabase } from "@/lib/supabase";
  import type { RealtimePostgresChangesPayload } from "@supabase/realtime-js";
  import { userId } from "@/store/user";
  import { toaster } from "@/store/toast";
  import ChatRoomCreate from "@/components/ChatRoomCreate.svelte";
  import ChatRoomSelect from "@/components/ChatRoomSelect.svelte";
  import ChatMessageCreate from "@/components/ChatMessageCreate.svelte";
  import ChatMessageSubscribe from "@/components/ChatMessageSubscribe.svelte";
  import { roomId, roomName } from "@/store/room";
  import { noReadTotalState, noReadCountState } from "@/store/read";
  import type { Message } from "@/types/supabase";
  import { timeChange } from "@/lib/dateconverter";
  import GetProfiles, {
    fetchUsers,
    getUserName,
  } from "@/components/GetProfiles.svelte";
  import type { Profile } from "@/types/supabase";

  let uid: string | null = null;
  let messages: Message[] = [];
  let selectRoom: string | null = null;
  let users: Profile[] = [];
  let is_disable = true;
  let scrollContainer: HTMLElement | null = null;

  $: {
    uid = $userId;
    if (uid) is_disable = false;
  }

  const fetchMessages = async () => {
    selectRoom = $roomId;
    if (selectRoom) {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })
        .eq("room_id", selectRoom);

      if (error) {
        console.error("接続できませんでした", error.message);
      } else {
        messages = data;
        readsMessage();
        noReadCountState.set({ ...$noReadCountState, [selectRoom]: 0 });
      }
    }
  };

  const readsMessage = async () => {
    const { error: reads_error } = await supabase
      .from("reads")
      .upsert({ room_id: $roomId, uid: uid, last_read_at: new Date() })
      .select();
    if (reads_error) {
      console.error("error", reads_error.message);
    }
  };

  const messageListener = (
    payload: RealtimePostgresChangesPayload<Message>
  ) => {
    if (payload.errors) console.error("payload error", payload.errors);
    if (payload.eventType === "INSERT") {
      const { uid: newUid, room_id: newRoomId } = payload.new;
      if ($roomId === newRoomId) messages = [...messages, payload.new];
      if (newRoomId && newUid !== uid && newRoomId !== selectRoom) {
        const countPlus = isNaN($noReadCountState[newRoomId])
          ? 1
          : $noReadCountState[newRoomId] + 1;
        noReadCountState.set({
          ...$noReadCountState,
          [newRoomId]: countPlus,
        });
      }
    }
  };

  const scrollToBottom = () => {
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  };

  onMount(async () => {
    await fetchMessages();
    users = await fetchUsers();
  });

  afterUpdate(() => {
    scrollToBottom();
  });
</script>

<div class="flex gap-5 justify-center">
  <div class="flex flex-col gap-2 w-96">
    <ChatRoomCreate />
    <ChatRoomSelect {fetchMessages} />
  </div>

  <ChatMessageSubscribe {messageListener} />

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
            <div class="chat-header">
              {getUserName(message.uid)}
            </div>
            <div class="chat-bubble break-words text-left">{message.text}</div>
            <div class="chat-footer opacity-50">
              <time>{timeChange(message.created_at)}</time>
            </div>
          </div>
        {:else}
          <div class="chat chat-end">
            <div class="chat-header">
              {getUserName(message.uid)}
            </div>
            <div class="chat-bubble">{message.text}</div>
            <div class="chat-footer opacity-50">
              <time>{timeChange(message.created_at)}</time>
            </div>
          </div>
        {/if}
      {/each}
    </div>

    <ChatMessageCreate />
  </div>
</div>
