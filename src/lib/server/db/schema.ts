import { integer, text, unique, sqliteTable } from "drizzle-orm/sqlite-core";

export const streams = sqliteTable("streams", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  url: text("url"),
  stream_url: text("stream_url"),
  room: text("room"),
  start_date: integer("start_date"),
  end_date: integer("end_date"),
  description: text("description"),
  abstract: text("abstract"),
});

export const votes = sqliteTable(
  "votes",
  {
    voter: text("voter").notNull(),
    choice: text("choice")
      .notNull()
      .references(() => streams.id, { onDelete: "cascade" }),
  },
  (t) => [unique().on(t.voter, t.choice)],
);
