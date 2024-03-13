<script lang="ts">
  import { supabase } from "../lib/supabase";

  export let url: string | null;

  let avatarUrl: string | null = null;
  let bloburl: string | null = null;
  let loading = false;

  $: if (url) getImages(url);

  const getImages = async (path: string) => {
    try {
      loading = true;

      const { data: blob, error: err_blob } = await supabase.storage
        .from("avatars")
        .download(path);

      const { data } = await supabase.storage
        .from("avatars")
        .getPublicUrl(path);
      if (err_blob) {
        console.error("エラー:", err_blob.message);
      }
      const url = data.publicUrl;

      if (err_blob) {
        throw err_blob;
      }

      bloburl = URL.createObjectURL(blob);

      avatarUrl = url;
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error downloading image: ", error.message);
      }
    } finally {
      loading = false;
    }
  };
</script>

<p>blobで取得</p>
<img src={bloburl} alt="" />
<p>getpublicurlで取得</p>
<img src={avatarUrl} alt="" />
