import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { Pool } from "pg";
import postgres from "postgres";
import { Network, PullPolicy, StartedNetwork } from "testcontainers";

const PG_PORT = process.env.PG_VERSION === "17" ? 5732 : 5632;

export const pool = new Pool({
  host: "localhost",
  port: PG_PORT,
  user: "user",
  password: "password",
  database: "drizzle_zero",
});

export const postgresJsClient = postgres(
  `postgres://user:password@localhost:${PG_PORT}/drizzle_zero`,
);

let startedNetwork: StartedNetwork | null = null;
let postgresContainer: StartedPostgreSqlContainer | null = null;

export const shutdown = async () => {
  try {
    await pool.end();
    await postgresContainer?.stop({ remove: true });
    await startedNetwork?.stop();
  } catch (error) {}
};

export const startPostgres = async () => {
  startedNetwork = await new Network().start();

  // Start PostgreSQL container
  postgresContainer = await new PostgreSqlContainer(
    `postgres:${process.env.PG_VERSION ?? "16"}`,
  )
    .withDatabase("drizzle_zero")
    .withUsername("user")
    .withPassword("password")
    .withNetwork(startedNetwork)
    .withNetworkAliases("postgres-db")
    .withExposedPorts({
      container: 5432,
      host: PG_PORT,
    })
    .withCommand([
      "postgres",
      "-c",
      "wal_level=logical",
      "-c",
      "max_wal_senders=10",
      "-c",
      "max_replication_slots=5",
      "-c",
      "hot_standby=on",
      "-c",
      "hot_standby_feedback=on",
    ])
    .withPullPolicy(PullPolicy.alwaysPull())
    .start();

  return {
    postgresContainer,
  };
};
