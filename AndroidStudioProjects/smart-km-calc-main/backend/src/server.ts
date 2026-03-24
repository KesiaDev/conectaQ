import Fastify from "fastify";
import cors from "@fastify/cors";
import authPlugin from "./plugins/auth";
import authRoutes from "./routes/auth";
import fuelEntriesRoutes from "./routes/fuelEntries";
import tollsRoutes from "./routes/tolls";
import vehicleCostsRoutes from "./routes/vehicleCosts";
import { prisma } from "./lib/prisma";

const server = Fastify({ logger: true });

async function main() {
  await server.register(cors, { origin: true });
  await server.register(authPlugin);

  server.register(authRoutes, { prefix: "/api" });
  server.register(fuelEntriesRoutes, { prefix: "/api" });
  server.register(tollsRoutes, { prefix: "/api" });
  server.register(vehicleCostsRoutes, { prefix: "/api" });

  server.get("/health", async () => ({ status: "ok" }));

  const port = parseInt(process.env.PORT || "3000");
  await server.listen({ port, host: "0.0.0.0" });

  const signals = ["SIGTERM", "SIGINT"] as const;
  signals.forEach((signal) => {
    process.on(signal, async () => {
      await server.close();
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
