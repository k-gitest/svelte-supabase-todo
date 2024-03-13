<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "./lib/supabase";
  import type { AuthSession } from "./lib/supabase";
  import Router from "svelte-spa-router";
  import { push, location } from "svelte-spa-router";
  import { userId } from "./store/user";
  import Home from "./pages/home.svelte";
  import Header from "./components/Header.svelte";
  import Footer from "./components/Footer.svelte";
  import Toast from "./components/Toast.svelte";
  import About from "./pages/about.svelte";
  import Signin from "./pages/signin.svelte";
  import Dashboard from "./pages/dashboard.svelte";
  import Profile from "./pages/user/profile.svelte";
  import Todo from "./pages/todo.svelte";
  import Callback from "./pages/auth/callback.svelte";

  let session: AuthSession | null = null;
  let loading = true;

  onMount(async () => {
    await supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        session = data.session;
        userId.set(session.user.id);
      } else {
        session = null;
        userId.set(null);
      }
      loading = false;
    });

    await supabase.auth.onAuthStateChange((_event, _session) => {
      if (_session) {
        session = _session;
        userId.set(session.user.id);
      } else {
        session = null;
        userId.set(null);
      }
      loading = false;
    });
  });

  const routes = {
    "/": Home,
    "/about": About,
    "/login": Signin,
    "/dashboard": Dashboard,
    "/user/profile": Profile,
    "/todo": Todo,
    "/auth/callback": Callback,
    "*": Home,
  };

  const protectedPaths = ["/dashboard", "/todo", "/user"];

  const guardedPages = ["/login"];

  $: {
    if (!loading) {
      if (
        !session &&
        protectedPaths.some((protectedPath) =>
          $location.startsWith(protectedPath)
        )
      ) {
        push("#/login");
      }

      if (
        session &&
        guardedPages.some((guardedPage) => $location.startsWith(guardedPage))
      ) {
        push("#/dashboard");
      }
    }
  }
</script>

<Header {session} />
<main class="min-h-lvh p-2 text-center">
  <Router {routes} restoreScrollState={true} />
</main>
<Toast />
<Footer />

<style>
  :root {
    font-family: "Segoe UI", "Helvetica Neue", Arial,
      "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans", Meiryo,
      -apple-system, BlinkMacSystemFont, Roboto, Oxygen, Ubuntu, Cantarell,
      "Open Sans", sans-serif;
  }
</style>
