<script lang="ts" context="module">
  import { supabase } from "@/lib/supabase";
  import { noReadTotalState, noReadCountState } from "@/store/read";

  type LastRead = {
    room_id: string;
    uid: string;
    last_read_at: Date;
  };

  let last_read: LastRead[] = [];
  let noReadMessageTotal: number = 0;
  let noReadMessageCount: { [key: string]: number } = {};

  export const ChatReadCount = async (uid: string | null) => {
    const { data, error } = await supabase
      .from("reads")
      .select("*")
      .eq("uid", uid)
      .order("last_read_at", { ascending: true });

    if (error) {
      console.error("接続できませんでした", error.message);
    } else {
      last_read = data ?? [];
    }

    const { data: noReadData, error: noReadError } = await supabase
      .from("messages")
      .select("*")
      .neq("uid", uid)
      .gt("created_at", last_read[0]?.last_read_at);

    if (noReadError) {
      console.error("接続できませんでした", noReadError.message);
    } else {
      noReadData.forEach((message) => {
        const roomId = message.room_id;
        const roomLastRead = last_read.find(
          (entry) => entry.room_id === roomId
        )?.last_read_at;

        if (roomLastRead && message.created_at > roomLastRead) {
          noReadMessageCount[roomId] = noReadMessageCount[roomId]
            ? noReadMessageCount[roomId] + 1
            : 1;
        }
      });

      noReadMessageTotal = Object.values(noReadMessageCount).reduce(
        (total, count) => total + count,
        0
      );

      noReadTotalState.set(noReadMessageTotal);
      noReadCountState.set(noReadMessageCount);
    }
  };
</script>
