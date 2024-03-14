<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from "svelte";
  import { supabase } from "@/lib/supabase";
  import { userId } from "@/store/user";
  import { toaster } from "@/store/toast";

  let uid: string | null = null;
  let messages = [];
  let is_disable = true;
  let scrollContainer = "";
  let prevMessageCount = 0;

  $: {
    uid = $userId;
    if (uid) is_disable = false;
  }

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("接続できませんでした", error.message);
    } else {
      messages = data;
    }
  };

  const messageListener = (payload) => {
    if (payload.errors) console.error("payload error", payload.errors);
    messages = [...messages, payload.new];
  };

  const sendMessage = async (event: SubmitEvent) => {
    event.preventDefault();
    is_disable = true;
    try {
      const formData = new FormData(event.target as HTMLFormElement);
      const text = formData.get("text") as string;

      const { error } = await supabase.from("messages").insert([{ text, uid }]);

      toaster.set({ isActive: true, message: "投稿完了！", class: "success" });
      document.getElementById("chatForm").reset();
      is_disable = false;
    } catch (error) {
      console.error("送信できませんでした", error.message);
      toaster.set({ isActive: true, message: "送信できませんでした" });
    } finally {
      setTimeout(() => {
        toaster.set({ isActive: false });
      }, 3000);
    }
  };

  const scrollToBottom = () => {
    if (scrollContainer) {
      scrollContainer.scrollTo(0, scrollContainer.scrollHeight);
    }
  };

  onMount(async () => {
    await fetchMessages();

    await supabase
      .channel("roomone")
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

  onDestroy(async () => {
    await supabase.channel("roomone").unsubscribe();
  });

  afterUpdate(() => {
    scrollToBottom();
  });
</script>

<div class="flex justify-center">
  <div class="w-96 h-96 overflow-x-auto" bind:this={scrollContainer}>
    {#each messages as message}
      {#if message.uid === uid}
        <div class="chat chat-start">
          <div class="chat-bubble">{message.text}</div>
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
        <input
          type="text"
          name="text"
          class="input input-bordered w-full max-w-xs"
          placeholder="メッセージを入力してください"
        />
        <button type="submit" class="btn btn-square" disabled={is_disable}
          >Send</button
        >
      </div>
    </form>
  </div>
</div>
