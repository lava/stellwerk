import { VotingMachine } from "$lib/voting-machine";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const vm = new VotingMachine();
  const current_stream = await vm.getCurrentStream();

  // Get votes since timestamp (default: last 10 seconds)
  const since = Number(url.searchParams.get("since")) || Date.now() - 10000;
  const recent_votes = await vm.getRecentVotes(since);

  return json({
    stream_url: current_stream?.stream_url,
    stream_id: current_stream?.id ?? null,
    stream_title: current_stream?.title ?? null,
    recent_votes,
  });
};