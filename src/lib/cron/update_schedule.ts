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

function mapRoomToStreamUrl(room: string): string {
  switch (room) {
    case "Saal 1":
      return "https://streaming.media.ccc.de/38c3/embed/eins/hls/native";
    case "Saal ZIGZAG":
      return "https://streaming.media.ccc.de/38c3/embed/zigzag/hls/native";
    case "Saal GLITCH":
      return "https://streaming.media.ccc.de/38c3/embed/glitch/hls/native";
  }
  return "unknown room";
}

async function main() {
  const vm = new VotingMachine();
  const BASE_URL =
    "https://fahrplan.events.ccc.de/congress/2024/fahrplan/schedule/export/schedule.json";
  const response = await fetch(BASE_URL);
  const schedule = await response.json();
  for (const event of parseSchedule(schedule)) {
    const [hours, minutes] = event.duration.split(":");
    const duration =
      (parseInt(hours) * 60 * 60 + parseInt(minutes) * 60) * 1000;
    vm.upsertStream({
      id: event.guid,
      title: event.title,
      room: event.room,
      stream_url: mapRoomToStreamUrl(event.room),
      url: event.url,
      description: event.description,
      abstract: event.abstract,
      start_date: new Date(event.date),
      end_date: new Date(new Date(event.date).getTime() + duration),
    });
  }
}

main();

