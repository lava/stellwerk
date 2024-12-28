import { VotingMachine } from "$lib/voting-machine";
import { json } from "@sveltejs/kit";

export async function GET() {
  const vm = new VotingMachine();
  const current_stream = await vm.getCurrentStream();

  return json({
      stream_url: current_stream?.stream_url,
    });
}