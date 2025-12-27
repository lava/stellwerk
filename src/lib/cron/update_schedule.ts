import { VotingMachine } from "../voting-machine";

function* parseSchedule(schedule: any) {
  for (const day of schedule.schedule.conference.days) {
    for (const room of Object.values(day.rooms)) {
      for (const event of room as any) {
        yield event;
      }
    }
  }
}

function mapRoomToStreamUrl(room: string): string | null {
  switch (room) {
    case "One":
      return "https://streaming.media.ccc.de/39c3/embed/one/hls/native";
    case "Ground":
      return "https://streaming.media.ccc.de/39c3/embed/ground/hls/native";
    case "Zero":
      return "https://streaming.media.ccc.de/39c3/embed/zero/hls/native";
    case "Fuse":
      return "https://streaming.media.ccc.de/39c3/embed/fuse/hls/native";
  }
  return null;
}

const SCHEDULE_URLS = [
  "https://api.events.ccc.de/congress/2025/schedule.json",
] as const;

async function main() {
  const vm = new VotingMachine();

  const unknownRooms = new Set<string>();

  for (const scheduleUrl of SCHEDULE_URLS) {
    const response = await fetch(scheduleUrl);
    const schedule = await response.json();
    for (const event of parseSchedule(schedule)) {
      const [hours, minutes] = event.duration.split(":");
      const duration =
        (parseInt(hours) * 60 * 60 + parseInt(minutes) * 60) * 1000;

      const streamUrl = mapRoomToStreamUrl(event.room);
      if (!streamUrl) {
        unknownRooms.add(event.room);
        continue;
      }
      vm.upsertStream({
        id: event.guid,
        title: event.title,
        room: event.room,
        stream_url: streamUrl,
        url: event.url,
        description: event.description,
        abstract: event.abstract,
        start_date: new Date(event.date),
        end_date: new Date(new Date(event.date).getTime() + duration),
      });
    }
  }
  console.log("Skipped events with unknown rooms:");
  for (const room of unknownRooms) {
    console.log(`- ${room}`);
  }
}

main();
