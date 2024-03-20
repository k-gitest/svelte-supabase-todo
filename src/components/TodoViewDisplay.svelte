<script lang="ts">
  import TodoUpdate from '../components/TodoUpdate.svelte';
  import TodoDelete from '../components/TodoDelete.svelte';
  import Modal from '../components/Modal.svelte'
  import type {Todo} from '../types/supabase'
  
  export let todo_view_data: Todo[]
  export let get_todo_all: () => void;
  let props_update_id = ''
  let props_delete_id = ''
  let modalId = 'my_modal'

  const priorityClasses = [
    ['low', 'badge-success'],
    ['medium', 'badge-warning'],
    ['high', 'badge-error']
  ];

  const openUpdateModal = (id: string) => {
    props_update_id = id
    const my_modal = document.getElementById('my_modal') as HTMLDialogElement ;
    my_modal.showModal()
  }
</script>

{#if todo_view_data.length > 0}
  {#each todo_view_data as todo}
    <div class="flex justify-center items-center">
      <div class="card w-96 base-200 base-content border mb-2">
        <div class="card-body">
          <h2 class="card-title">{todo.title}</h2>
          {#each priorityClasses as [priority, className]}
            {#if todo.priority == priority}
              <div class="badge {className} gap-2">
                {todo.priority}
              </div>
            {/if}
          {/each}
          {#if todo.completed}
            <div class="badge badge-ghost">close</div>
          {/if}
          <p class="text-left">{todo.body}</p>
          <div class="card-actions justify-end">
            <button class="btn" on:click={() => openUpdateModal(todo.id)}>編集</button>
            <button class="btn" on:click={() => props_delete_id = todo.id}>削除</button>
          </div>
          <div>
              <time class="text-sm block text-right">{todo.updated_at || todo.created_at}</time>
          </div>
        </div>
      </div>
    </div>
  {/each}
{:else}
  <div class="flex justify-center items-center">
    <div class="card w-96 base-200 base-content border mb-2">
      <div class="card-body">
        <p class="text-left">該当データがありません</p>
      </div>
    </div>
  </div>
{/if}

<Modal {modalId}>
  <TodoUpdate {props_update_id} {get_todo_all} />
</Modal>
<TodoDelete {props_delete_id} {get_todo_all} />