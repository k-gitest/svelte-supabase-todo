<script lang="ts">
  import { userId } from "../store/user";
  import { supabase } from "../lib/supabase";
  import { toaster } from "../store/toast";
  import type { Todo } from "../types/supabase";

  let uid: string | null = $userId;
  export let props_update_id: string | null = null;
  export let get_todo_all: () => void;

  let loading = false;
  let error_message = "";

  $: {
    if (props_update_id) {
      handle_todo_select_update(props_update_id);
    }
  }

  let update_data = {};
  let update_id = "";
  let update_title = "";
  let update_body = "";
  let update_priority = "low";
  let update_completed = false;
  let update_is_disable = true;
  let formDirty = false;

  $: update_is_disable = !formDirty;

  const handle_todo_select_update = async (props_id: string) => {
    try {
      loading = true;

      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("id", props_id)
        .single();

      update_id = data.id;
      update_title = data.title;
      update_body = data.body;
      update_priority = data.priority;
      update_completed = data.completed;
      formDirty = false;
    } catch (error: any) {
      console.log(error.message);
      error_message = "接続できませんでした";
    } finally {
      loading = false;
    }
  };

  const handle_todo_update = async (event: SubmitEvent) => {
    update_is_disable = true;
    event.preventDefault();

    const updatedata = {
      uid,
      title: update_title,
      body: update_body,
      priority: update_priority,
      completed: update_completed,
    };

    try {
      const { data, error } = await supabase
        .from("todos")
        .update(updatedata)
        .eq("id", update_id);

      console.log("編集しました");
      update_is_disable = false;
      get_todo_all();
      const my_modal = document.getElementById("my_modal") as HTMLDialogElement;
      my_modal.close();
      toaster.set({ isActive: true, message: "更新完了！", class: "success" });
    } catch (error: any) {
      console.log(error.message);
      toaster.set({ isActive: true, message: "更新できませんでした" });
      error_message = "更新できませんでした";
    } finally {
      setTimeout(() => {
        toaster.set({ isActive: false });
      }, 3000);
    }
  };

  const handleInputChange = () => {
    formDirty = true;
  };
</script>

{#if loading}
  <div class="w-96 h-96 flex justify-center items-center">
    <span class="loading loading-spinner loading-lg" />
  </div>
{:else}
  <div class="flex justify-center items-center">
    <form on:submit={handle_todo_update}>
      <div class="grid grid-col gap-4">
        <div>
          <label for="update_title" class="block">タイトル：</label>
          <input
            type="text"
            id="update_title"
            bind:value={update_title}
            on:input={handleInputChange}
            placeholder="タイトルを入力"
            class="input input-bordered w-full max-w-xs"
          />
        </div>
        <div>
          <label for="update_body" class="block">本文：</label>
          <input
            type="text"
            id="update_body"
            bind:value={update_body}
            on:input={handleInputChange}
            placeholder="本文を入力"
            class="input input-bordered w-full max-w-xs"
          />
        </div>
        <div>
          <span class="block">優先度：</span>
          <label for="update_low">
            <input
              type="radio"
              id="update_low"
              class="radio radio-xs"
              bind:group={update_priority}
              value="low"
              checked
              on:change={handleInputChange}
            />
            <span>低</span>
          </label>
          <label for="update_medium">
            <input
              type="radio"
              id="update_medium"
              class="radio radio-xs"
              bind:group={update_priority}
              value="medium"
              on:change={handleInputChange}
            />
            <span>中</span>
          </label>
          <label for="update_high">
            <input
              type="radio"
              id="update_high"
              class="radio radio-xs"
              bind:group={update_priority}
              value="high"
              on:change={handleInputChange}
            />
            <span>高</span>
          </label>
        </div>
        <div>
          <label for="update_completed"
            ><span class="block">完了：</span>
            <input
              type="checkbox"
              id="update_completed"
              class="toggle toggle-sm"
              bind:checked={update_completed}
              on:change={handleInputChange}
            />
          </label>
        </div>
        <div>
          <button
            type="submit"
            class="btn btn-wide"
            disabled={update_is_disable}>送信</button
          >
        </div>
      </div>
    </form>
  </div>
{/if}
