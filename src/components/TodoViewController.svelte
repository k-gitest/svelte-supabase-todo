<script lang="ts">
  import { onMount } from 'svelte'
  import TodoCreate from './TodoCreate.svelte';
  import TodoViewDisplay from './TodoViewDisplay.svelte';
  import {TodoGetAllData} from './TodoGetAllData.svelte'
  import type {Todo} from '../types/supabase'

  let todo_all_data: Todo[] = []
  let todo_view_data: Todo[] = []

  let query_priority: string[] = []
  let query_completed = false

  let loading = false
  let error_message = ''

  onMount(() => {
    get_todo_all()
  })

  export const get_todo_all = async() => {
    try{
      loading = true
      todo_all_data = await TodoGetAllData()
      handle_todo_search()
    }
    catch(error: any){
      console.log(error.message)
      error_message = "接続できませんでした"
    }
    finally{
      loading = false
    }
  }

  const handleCheckboxChange = async (event: Event) => {
    const { checked, value, id } = event.target as HTMLInputElement;
    const check_id = id.split('-')[0]
    
    switch (check_id) {
      case 'priority':
        if (checked) {
          query_priority = [...query_priority, value];
        } else {
          query_priority = query_priority.filter(priority => priority !== value);
        }
        break;
      case 'completed':
        query_completed = checked;
        break;
    }
    handle_todo_search()
  }
  
  const handle_todo_search = async () => {
    let filter_data = todo_all_data
    
    if(query_priority.length > 0){
      filter_data = filter_data.filter(todo => query_priority.includes(todo.priority))
    }
    if(query_completed){
      filter_data = filter_data.filter(todo => todo.completed)
    }
    else {
      filter_data = filter_data.filter(todo => !todo.completed)
    }
    todo_view_data = filter_data
  }
</script>

<div class="flex w-100 justify-center items-start gap-3">
  <TodoCreate get_todo_all={get_todo_all} />
  <div class="flex flex-col">
    <div>
      {#each [{ value: 'low', display: '低' }, { value: 'medium', display: '中' }, { value: 'high', display: '高' }] as priority}
        <label for={`priority-${priority.value}`} class="mr-1">
          <input type="checkbox" id={`priority-${priority.value}`} value={priority.value} on:change={handleCheckboxChange} class="checkbox-xs" /> 
          {priority.display}
        </label>
      {/each}
      <label for="completed-check"><input type="checkbox" id="completed-check" value="true" on:change={handleCheckboxChange} class="toggle toggle-xs" /> close</label>
    </div>
    {#if loading}
      <div class="w-96 h-96 flex justify-center items-center">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    {:else if error_message}
      <div class="card w-96 border">
        {error_message}
      </div>
    {:else}
      <TodoViewDisplay {todo_view_data} {get_todo_all} />
    {/if}
  </div>
</div>

