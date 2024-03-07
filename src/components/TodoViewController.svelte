<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase } from '../lib/supabase'
  import { userId } from '../store/user';
  import TodoUpdate from '../components/TodoUpdate.svelte';
  import TodoDelete from '../components/TodoDelete.svelte';
  import TodoCreate from '../components/TodoCreate.svelte';
  import Modal from '../components/Modal.svelte';
  import {timeChange} from '../lib/dateconverter';

  let uid: string | null = null;

  let todo_all_data = []
  let todo_view_data = []

  let query_priority = []
  let query_completed = false

  let props_update_id = ''
  let props_delete_id = ''

  $: {
    uid = $userId;
  }

  onMount(async() => {
    get_todo_all()
  })

  const get_todo_all = async() => {
    try{
      const { data, error } = await supabase.from('todos').select('*').order('updated_at', { ascending: false })
      todo_all_data = data.filter(todo => {
        todo.created_at = timeChange(todo.created_at)
        if(todo.updated_at)todo.updated_at = timeChange(todo.updated_at)
        return todo
      })
      todo_view_data = data.filter(todo => !todo.completed)
      handle_todo_search()
    }
    catch(error){
      console.log(error.message)
    }
  }

  const handleCheckboxChange = async (event) => {
    const { checked, value, id } = event.target;
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
      default:
        break;
    }
    handle_todo_search()
  }
  
  const handle_todo_search = async () => {

    if (query_priority.length || query_completed) {
      todo_view_data = todo_all_data.filter(todo => {
        if (!query_completed && query_priority.includes(todo.priority) && !todo.completed) {
          return true;
        }
        if(query_completed && todo.completed && query_priority.includes(todo.priority)){
          return true
        }
        if(!query_priority.length && query_completed && todo.completed){
          return true
        }

        return false;
      });
    } else {
      todo_view_data = todo_all_data.filter(todo => !todo.completed);
    }

  }
</script>

<div class="flex w-100 justify-center items-start gap-3">
  <TodoCreate get_todo_all={get_todo_all} />

  <div class="flex flex-col">
    <div>
      <label for="priority-low"><input type="checkbox" id="priority-low" value="low" on:change={handleCheckboxChange} class="checkbox-xs" /> row</label>
      <label for="priority-medium"><input type="checkbox" id="priority-medium" value="medium" on:change={handleCheckboxChange} class="checkbox-xs" /> medium</label>
      <label for="priority-high"><input type="checkbox" id="priority-high" value="high" on:change={handleCheckboxChange} class="checkbox-xs" /> high</label>
      <label for="completed-check"><input type="checkbox" id="completed-check" value="true" on:change={handleCheckboxChange} class="checkbox-xs" /> close</label>
    </div>
    
    {#if todo_view_data.length > 0}
      {#each todo_view_data as todo}
        <div class="flex justify-center items-center">
          <div class="card w-96 base-200 base-content border mb-2">
            <div class="card-body">
              <h2 class="card-title">{todo.title}</h2>
              {#if todo.priority == 'low'}
                <div class="badge badge-success gap-2">
                  {todo.priority}
                </div>
              {:else if todo.priority == 'medium'}
                <div class="badge badge-warning gap-2">
                  {todo.priority}
                </div>
              {:else if todo.priority == 'high'}
                <div class="badge badge-error gap-2">
                  {todo.priority}
                </div>
              {/if}
              {#if todo.completed}
                <div class="badge badge-ghost">close</div>
              {/if}
              <p class="text-left">{todo.body}</p>
              <div class="card-actions justify-end">
                <button class="btn" onclick="my_modal.showModal()" on:click={() => props_update_id = todo.id}>編集</button>
                <button class="btn" on:click={() => props_delete_id = todo.id}>削除</button>
              </div>
              <div>
                {#if todo.updated_at}
                  <time class="text-sm block text-right">{todo.updated_at}</time>
                  {:else}
                  <time class="text-sm block text-right">{todo.created_at}</time>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    {/if}
    
    <TodoUpdate {props_update_id} get_todo_all={get_todo_all} />
    <TodoDelete {props_delete_id} get_todo_all={get_todo_all} />
  </div>
</div>