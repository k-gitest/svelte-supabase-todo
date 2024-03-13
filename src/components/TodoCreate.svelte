<script lang="ts">
  import { supabase } from '../lib/supabase'
  import { userId } from '../store/user';
  import { toaster } from '../store/toast';
  
  export let get_todo_all: () => void;

  let uid: string | null = null;
  let title = ''
  let body = ''
  let priority = 'low'
  let is_disable = true

  $: {
    uid = $userId;
    if(uid)is_disable = false
  }

  const handleSubmit = async (event: SubmitEvent) => {
    is_disable = true
    event.preventDefault();

    const postdata = {
      uid,
      title,
      body,
      priority,
    }

    try{
      toaster.set({isActive: true, message: '送信中...'})
      const { data, error } = await supabase.from('todos').insert(postdata)
      if(error){
        throw error;
      }

      console.log('送信されました', data)
      toaster.set({isActive: true, message: '送信されました', class: 'success'})
      title = '';
      body = '';
      priority = 'low';
      is_disable = false
      await get_todo_all()
    }
    catch(error: any){
      console.error('エラー:', error.message);
      toaster.set({isActive: true, message: '送信できませんでした'})
    }
    finally{
      setTimeout(() => {
        toaster.set({isActive: false});
      }, 3000);
    }
  }
</script>

<div class="flex justify-center items-center">
  <form on:submit={handleSubmit}>
    <div class="grid grid-col gap-4">
      <div>
        <label for="title" class="block">タイトル：</label>
          <input type="text" id="title" bind:value={title} placeholder="タイトルを入力" class="input input-bordered w-full max-w-xs" />
      </div>
      <div>
        <label for="body" class="block">本文：</label>
          <input type="text" id="body" bind:value={body} placeholder="本文を入力" class="input input-bordered w-full max-w-xs" />
      </div>
      <div>
        <span class="block">優先度：</span>
        <label for="low">
          <input type="radio" id="low" class="radio radio-xs" bind:group={priority} value="low" checked />
          <span>低</span>
        </label>
        <label for="medium">
          <input type="radio" id="medium" class="radio radio-xs" bind:group={priority} value="medium" />
          <span>中</span>
        </label>
        <label for="high">
          <input type="radio" id="high" class="radio radio-xs" bind:group={priority} value="high" />
          <span>高</span>
        </label>
      </div>
      <div>
        <button type="submit" class="btn btn-wide" disabled={is_disable}>送信</button>
      </div>
    </div>
  </form>
</div>