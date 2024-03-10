<script lang="ts">
  import { adminAuthClient } from '../lib/supabasedelete'
  import { userId } from '../store/user';
  import { toaster } from '../store/toast';

  const uid = $userId;
  
  const handle_delete_user = async () =>{
    try{
      toaster.set({isActive: true, message: "接続中..."})
      
      const { data, error } = await adminAuthClient.deleteUser(uid)

      if(error instanceof Error){
        throw new Error('Error deleting user');
      }

      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
        console.log('削除後にログアウトしました');
        toaster.set({ isActive: true, message: "完了！", class: 'success'})

      } catch (error) {
        console.error('削除後ログアウトエラー:', error.message);
        toaster.set({isActive: true, message: "接続できませんでした"})
      }
    }
    catch(error){
      console.error(error);
      toaster.set({isActive: true, message: "削除できませんでした"})
    }
    finally{
      setTimeout(() => {
        toaster.set({isActive: false});
      }, 3000);
    }
  } 

</script>

<div class="p-3">
  <button class="btn btn-wide btn-error" on:click="{handle_delete_user}">退会</button>
</div>