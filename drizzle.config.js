const dbPath = process.env.DB || "votes.db";

// filepath: drizzle.config.js
module.exports = {
  dialect: "sqlite",
  url: dbPath,
  schema: "./src/lib/server/db/schema.ts",
  dbCredentials: "",
};
