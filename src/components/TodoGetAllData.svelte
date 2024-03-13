<script lang="ts" context="module">
  import { supabase } from '../lib/supabase'
  import { toaster } from '../store/toast';
  import {timeChange} from '../lib/dateconverter';
  import type {Todo} from '../types/supabase'

  let todo_all_data: Todo[] = []
  
  export const TodoGetAllData = async() => {
    try{
      toaster.set({isActive: true, message: "接続中..."})

      const { data, error } = await supabase.from('todos').select('*').order('updated_at', { ascending: false })

      if(data){
        todo_all_data = data.map(todo => ({
          ...todo,
          created_at: timeChange(todo.created_at),
          updated_at: todo.updated_at ? timeChange(todo.updated_at) : null
        }));
      }
      toaster.set({ isActive: true, message: "完了！", class: 'success'})
    }
    catch(error: any){
      console.log(error.message)
      toaster.set({isActive: true, message: "接続できませんでした"}) 
    }
    finally{
      setTimeout(() => {
        toaster.set({isActive: false});
      }, 3000);
      return todo_all_data
    }
  }
</script>