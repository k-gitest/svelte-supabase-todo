<script lang="ts">
  import { supabase } from "../lib/supabase";
  import { toaster } from "../store/toast";

  export let props_delete_id: string | null = null;
  export let get_todo_all: () => void;

  $: {
    if (props_delete_id) {
      handle_todo_delete(props_delete_id);
    }
  }

  const handle_todo_delete = async (id) => {
    try {
      toaster.set({ isActive: true, message: "削除中です..." });
      const { data, error } = await supabase
        .from("todos")
        .delete()
        .eq("id", id);
      console.log("削除しました");
      get_todo_all();
      toaster.set({
        isActive: true,
        message: "削除しました",
        class: "success",
      });
    } catch (error) {
      console.log(error.message);
      toaster.set({ isActive: true, message: "削除できませんでした" });
    } finally {
      setTimeout(() => {
        toaster.set();
      }, 3000);
    }
  };
</script>
