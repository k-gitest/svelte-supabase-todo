<script lang="ts">
  import { supabase } from '../lib/supabase'

  export let props_delete_id: string | null = null;
  export let get_todo_all

  $:{
    if(props_delete_id) {
      handle_todo_delete(props_delete_id)
    }
  }

  const handle_todo_delete = async(id) => {
    try{
      const { data, error } = await supabase.from('todos').delete().eq('id', id)
      console.log("削除しました")
      await get_todo_all()

    }
    catch(error){
      console.log(error.message)
    }
  }
</script>