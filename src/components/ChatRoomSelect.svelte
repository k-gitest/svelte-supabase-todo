<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "@/lib/supabase";
  import { toaster } from "@/store/toast";
  import { roomId, roomName } from "@/store/room";
  import { member_roomId, member_roomName } from "@/store/member";
  import { noReadTotalState, noReadCountState } from "@/store/read";
  import Modal from "@/components/Modal.svelte";
  import ChatRoomMember from "@/components/ChatRoomMember.svelte";
  import type { Room } from "@/types/supabase";

  export let selectRoom: string | null = null;
  export let fetchMessages: () => void;
  let rooms: Room[] = [];
  let is_disable = true;
  let modalId = "member_select";

  $: $noReadCountState;

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("接続できませんでした", error.message);
    } else {
      rooms = data;
    }
  };

  onMount(async () => {
    await fetchRooms();
    is_disable = false;
  });

  const handleRoomChange = async (room_id: string) => {
    selectRoom = room_id;
    roomId.set(room_id);
    rooms.find((room) => {
      if (room.room_id === selectRoom) roomName.set(room.room_name);
    });
    fetchMessages();
  };

  const openModal = (id: string, name: string) => {
    member_roomId.set(id);
    member_roomName.set(name);
    const my_modal = document.getElementById(modalId) as HTMLDialogElement;
    my_modal.showModal();
  };

  const deleteRoom = async (room_id: string) => {
    console.log(room_id);
    const { error } = await supabase
      .from("rooms")
      .delete()
      .eq("room_id", room_id);
    if (error) console.error(error.message);
    fetchRooms();
    fetchMessages();
    roomName.set(null);
  };
</script>

{#if rooms.length > 0}
  <div class="w-full justify-center">
    {#each rooms as room}
      <button
        on:click={() => handleRoomChange(room.room_id)}
        class="block w-full h-10 border text-left cursor-pointer flex justify-between items-center px-1 rounded-md mb-1"
      >
        <div class="flex items-center gap-2">
          <p>{room.room_name}</p>
        </div>

        <div>
          {#if $noReadCountState[room.room_id]}
            <div class="badge">{$noReadCountState[room.room_id]}</div>
          {/if}
          <button
            class="btn btn-square btn-sm "
            on:click={() => openModal(room.room_id, room.room_name)}
            disabled={is_disable}>+</button
          >
          <button
            class="btn btn-square btn-sm "
            on:click={() => deleteRoom(room.room_id)}
            disabled={is_disable}>×</button
          >
        </div>
      </button>
    {/each}
  </div>
{/if}

<Modal {modalId}>
  <ChatRoomMember />
</Modal>
