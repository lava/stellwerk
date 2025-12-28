import { drizzle } from "drizzle-orm/better-sqlite3";
import { votes, streams } from "$lib/server/db/schema";
import { sql, and, eq } from "drizzle-orm";

export type Timestamp = number;

export interface Stream {
  id: string;
  title: string;
  room?: string;
  url?: string;
  description?: string;
  abstract?: string;
  votes?: number;
  stream_url?: string;
  start_date: Date;
  end_date: Date;
}

export class VotingMachine {
  db: any;

  constructor() {
    // get db path from env
    const dbPath = process.env.DB ?? "votes.db";
    this.db = drizzle(dbPath);
  }

  async upsertStream(stream: Stream): Promise<void> {
    await this.db
      .insert(streams)
      .values({
        id: stream.id,
        title: stream.title,
        url: stream.url,
        description: stream.description,
        abstract: stream.abstract,
        stream_url: stream.stream_url,
        start_date: stream.start_date.getTime(),
        end_date: stream.end_date.getTime(),
      })
      .onConflictDoUpdate({
        target: [streams.id],
        set: {
          title: stream.title,
          url: stream.url,
          stream_url: stream.stream_url,
          start_date: stream.start_date.getTime(),
          end_date: stream.end_date.getTime(),
          abstract: stream.abstract,
          description: stream.description,
        },
      });
  }

  async getCurrentStream(): Promise<Stream | null> {
    const results = await this.db
      .select({
        id: streams.id,
        title: streams.title,
        url: streams.url,
        stream_url: streams.stream_url,
        start_date: streams.start_date,
        end_date: streams.end_date,
      })
      .from(votes)
      .leftJoin(streams, eq(streams.id, votes.choice))
      .where(sql`start_date <= ${Date.now()} AND end_date >= ${Date.now()}`)
      .groupBy(votes.choice)
      .orderBy(sql`count(*) DESC`)
      .limit(1);
    if (results.length === 0) {
      return null;
    }
    return {
      id: results[0].id,
      title: results[0].title,
      stream_url: results[0].stream_url,
      start_date: new Date(results[0].start_date),
      end_date: new Date(results[0].end_date),
    };
  }

  async vote(from_user: string, stream_id: string): Promise<void> {
    await this.db
      .insert(votes)
      .values({ voter: from_user, choice: stream_id, created_at: Date.now() })
      .onConflictDoNothing();
  }

  async getRecentVotes(since: Timestamp): Promise<{ streamTitle: string; timestamp: Timestamp }[]> {
    const results = await this.db
      .select({
        streamTitle: streams.title,
        timestamp: votes.created_at,
      })
      .from(votes)
      .innerJoin(streams, eq(streams.id, votes.choice))
      .where(sql`${votes.created_at} > ${since}`)
      .orderBy(votes.created_at);

    return results;
  }

  async getLiveStreams(): Promise<Stream[]> {
    const query = this.db.$with("query").as(
      this.db
        .select({
          stream_id: votes.choice,
          vote_count: sql`count(*)`.as("vote_count"),
        })
        .from(votes)
        .groupBy(votes.choice),
    );

    const stream_data = await this.db
      .with(query)
      .select({
        id: streams.id,
        title: streams.title,
        description: streams.description,
        abstract: streams.abstract,
        url: streams.url,
        start_date: streams.start_date,
        end_date: streams.end_date,
        vote_count: query.vote_count,
      })
      .from(streams)
      .leftJoin(query, eq(streams.id, query.stream_id))
      .where(sql`start_date <= ${Date.now()} AND end_date >= ${Date.now()}`);

    const _streams: Stream[] = stream_data.map((data: any) => ({
      id: data.id,
      title: data.title,
      url: data.url,
      votes: data.vote_count,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      description: data.description,
      abstract: data.abstract,
    }));
    return _streams;
  }

  async unvote(from_user: string, stream_id: string): Promise<void> {
    await this.db
      .delete(votes)
      .where(and(eq(votes.voter, from_user), eq(votes.choice, stream_id)));
  }

  async getUpcomingStreams(count: number): Promise<Stream[]> {
    const votes_subquery = this.db.$with("query").as(
      this.db
        .select({
          stream_id: votes.choice,
          vote_count: sql`count(*)`.as("vote_count"),
        })
        .from(votes)
        .groupBy(votes.choice),
    );

    const stream_data = await this.db
      .with(votes_subquery)
      .select({
        id: streams.id,
        title: streams.title,
        url: streams.url,
        start_date: streams.start_date,
        end_date: streams.end_date,
        vote_count: votes_subquery.vote_count,
        description: streams.description,
        abstract: streams.abstract,
      })
      .from(streams)
      .leftJoin(votes_subquery, eq(streams.id, votes_subquery.stream_id))
      .where(sql`start_date > ${new Date().getTime()}`)
      .orderBy(sql`start_date`)
      .limit(count);

    const _streams: Stream[] = stream_data.map((data: any) => ({
      id: data.id,
      title: data.title,
      url: data.url,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      votes: data.vote_count,
      description: data.description,
      abstract: data.abstract,
    }));
    return _streams;
  }

  async getUserVotes(from_user: string): Promise<string[]> {
    const user_votes = await this.db
      .select()
      .from(votes)
      .where(eq(votes.voter, from_user));
    return user_votes.map((x: any) => x.choice);
  }
}

export default VotingMachine;
