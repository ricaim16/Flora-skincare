// src/db/db.ts
import dns from "node:dns";
import net from "node:net";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import dotenv from "dotenv";

dotenv.config({ quiet: true }); // Load .env variables

// This network drops Node's parallel "Happy Eyeballs" connection attempts
// (multiple sockets dialed at once to different resolved IPs), even though
// a single sequential connection succeeds every time. Force IPv4 and disable
// the parallel dialing so outbound requests behave like a normal single
// connection attempt instead of racing several at once.
dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily(false);

const databaseUrl = process.env.NEON_DB_URL?.trim();

export const hasDatabase = Boolean(databaseUrl);

const sql = databaseUrl ? neon(databaseUrl) : null;

export const db = sql ? drizzle(sql) : null;
