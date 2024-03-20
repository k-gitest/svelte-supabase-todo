<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "@/lib/supabase";
  import { userId } from "@/store/user";
  import { toaster } from "@/store/toast";
  import { roomId, roomName } from "@/store/room";
  import Modal from "@/components/Modal.svelte";
  import ChatRoomMember from "@/components/ChatRoomMember.svelte";

  let uid: string | null = null;
  let rooms: string[] = [];
  export let selectRoom: string | null = null;
  export let fetchMessages: () => void;
  let is_disable = true;
  let modalId = "room_select";

  $: {
    uid = $userId;
    if (uid) is_disable = false;
  }

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { acending: true });

    if (error) {
      console.error("接続できませんでした", error.message);
    } else {
      rooms = data;
    }
  };

  onMount(async () => {
    await fetchRooms();
  });

  const handleRoomChange = async (room_id) => {
    selectRoom = room_id;
    roomId.set(room_id);
    rooms.find((room) => {
      if (room.room_id === selectRoom) roomName.set(room.room_name);
    });
    fetchMessages();
  };
</script>

{#if rooms.length > 0}
  <div class="w-full justify-center">
    {#each rooms as room}
      <div class="relative">
        <button
          on:click={() => handleRoomChange(room.room_id)}
          class="block w-full h-10 border text-left">{room.room_name}</button
        >
        <button
          class="absolute btn btn-square btn-sm top-1 right-1"
          onClick="room_select.showModal()"
          disabled={is_disable}>+</button
        >
      </div>
    {/each}
  </div>
{/if}

<Modal {modalId}>
  <ChatRoomMember />
</Modal>
