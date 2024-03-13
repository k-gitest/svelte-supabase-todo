<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "../lib/supabase";
  import Avatar from "../components/Avatar.svelte";
  import Image from "../components/Image.svelte";
  import type { ImageList } from "../types/supabase";

  type Profiles = {
    id: string;
    username: string | null;
    avatar_url: string | null;
    full_name: string | null;
    email: string;
    created_at: string;
    updated_at: string;
    website: string | null;
  };

  let profiles: Profiles[] | null = [];
  let loading = false;
  const imageUrl =
    import.meta.env.VITE_SUPABASE_URL + "/storage/v1/object/public/avatars/";
  let imageList: ImageList[];

  onMount(() => {
    getProfile();
  });

  const getProfile = async () => {
    loading = true;
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (data) profiles = data;

      const { data: imglist, error: list_err } = await supabase.storage
        .from("avatars")
        .list();
      if (imglist) {
        imageList = imglist.filter(
          (img) => img.name !== ".emptyFolderPlaceholder"
        );
      }
    } catch (error: any) {
      console.log(error.message);
    } finally {
      loading = false;
    }
  };
</script>

<h2 class="text-5xl">about</h2>
<p>アバウトのページ</p>

{#if loading}
  <span class="loading loading-spinner loading-lg" />
{:else if profiles}
  {#each profiles as profile}
    <div class="w-100 flex justify-center">
      <div class="w-96">
        <p>パス結合で取得</p>
        <img src={imageUrl + profile.avatar_url} alt="" />
        <Image url={profile.avatar_url} />

        <p>listでパス結合で取得</p>
        {#each imageList as image}
          <img src={imageUrl + image.name} alt="" />
        {/each}
      </div>
    </div>
    <p>{profile.username}</p>
    <p>{profile.website}</p>
  {/each}
{/if}
