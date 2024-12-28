import { fail, redirect } from "@sveltejs/kit";
import { VotingMachine } from "../../lib/voting-machine";
import type { PageServerLoad } from "./$types";

const vm = new VotingMachine();

export const load = (async ({ cookies }) => {
  const liveStream = await vm.getCurrentStream();

  return {
    stream_url: liveStream?.stream_url,
  };
}) satisfies PageServerLoad;

