<script lang="ts">
  import { supabase } from '../lib/supabase'
  import { adminAuthClient } from '../lib/supabasedelete'
  import { userId } from '../store/user';
  import { toaster } from '../store/toast';

  let uid: string | null = null
  uid = $userId;
  
  const handle_delete_user = async () =>{
    try{
      toaster.set({isActive: true, message: "接続中..."})
      if(uid){
        const { data, error } = await adminAuthClient.deleteUser(uid)
      }
      
      const { error } = await supabase.auth.signOut();
      console.log('削除後にログアウトしました');
      toaster.set({ isActive: true, message: "完了！", class: 'success'})
    }
    catch(error: any){
      console.error(error);
      if (error.message === 'Error deleting user') {
          toaster.set({ isActive: true, message: "削除できませんでした" });
      } else {
          toaster.set({ isActive: true, message: "ログアウトできませんでした" });
      }
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