import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

function toSnake(e: Record<string, unknown>) {
  return {
    id: e.id,
    user_id: e.userId,
    date: e.date,
    fuel_price: e.fuelPrice,
    liters: e.liters,
    fuel_type: e.fuelType,
    vehicle_name: e.vehicleName,
    usage_type: e.usageType,
    estimated_consumption: e.estimatedConsumption,
    estimated_range: e.estimatedRange,
    total_cost: e.totalCost,
    km: e.km,
    actual_km: e.actualKm,
    actual_consumption: e.actualConsumption,
    cost_per_km: e.costPerKm,
    status: e.status,
    created_at: e.createdAt,
    tolls: Array.isArray(e.tolls) ? (e.tolls as Record<string, unknown>[]).map(tollToSnake) : undefined,
  };
}

function tollToSnake(t: Record<string, unknown>) {
  return {
    id: t.id,
    user_id: t.userId,
    fuel_entry_id: t.fuelEntryId,
    description: t.description,
    amount: t.amount,
    created_at: t.createdAt,
  };
}

export default async function fuelEntriesRoutes(fastify: FastifyInstance) {
  const auth = { preHandler: [fastify.authenticate] };

  fastify.get("/fuel-entries", auth, async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const { status, limit } = request.query as { status?: string; limit?: string };
    const entries = await prisma.fuelEntry.findMany({
      where: { userId, ...(status ? { status } : {}) },
      orderBy: { date: "desc" },
      take: limit ? parseInt(limit) : 100,
      include: { tolls: true },
    });
    return reply.send(entries.map((e) => toSnake(e as unknown as Record<string, unknown>)));
  });

  fastify.post("/fuel-entries", auth, async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const body = request.body as Record<string, unknown>;
    const entry = await prisma.fuelEntry.create({
      data: {
        userId,
        fuelPrice: body.fuel_price as number,
        liters: body.liters as number | undefined,
        fuelType: (body.fuel_type as string) || "gasolina",
        vehicleName: body.vehicle_name as string | undefined,
        usageType: (body.usage_type as string) || "misto",
        estimatedConsumption: body.estimated_consumption as number | undefined,
        estimatedRange: body.estimated_range as number | undefined,
        totalCost: body.total_cost as number | undefined,
        km: (body.km as number) || 0,
        status: (body.status as string) || "open",
        date: body.date ? new Date(body.date as string) : new Date(),
      },
    });
    return reply.status(201).send(toSnake(entry as unknown as Record<string, unknown>));
  });

  fastify.put("/fuel-entries/:id", auth, async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    const existing = await prisma.fuelEntry.findFirst({ where: { id, userId } });
    if (!existing) return reply.status(404).send({ error: "Não encontrado" });
    const entry = await prisma.fuelEntry.update({
      where: { id },
      data: {
        ...(body.fuel_price !== undefined && { fuelPrice: body.fuel_price as number }),
        ...(body.liters !== undefined && { liters: body.liters as number }),
        ...(body.fuel_type !== undefined && { fuelType: body.fuel_type as string }),
        ...(body.vehicle_name !== undefined && { vehicleName: body.vehicle_name as string }),
        ...(body.usage_type !== undefined && { usageType: body.usage_type as string }),
        ...(body.estimated_consumption !== undefined && { estimatedConsumption: body.estimated_consumption as number }),
        ...(body.estimated_range !== undefined && { estimatedRange: body.estimated_range as number }),
        ...(body.total_cost !== undefined && { totalCost: body.total_cost as number }),
        ...(body.km !== undefined && { km: body.km as number }),
        ...(body.actual_km !== undefined && { actualKm: body.actual_km as number }),
        ...(body.actual_consumption !== undefined && { actualConsumption: body.actual_consumption as number }),
        ...(body.cost_per_km !== undefined && { costPerKm: body.cost_per_km as number }),
        ...(body.status !== undefined && { status: body.status as string }),
      },
    });
    return reply.send(toSnake(entry as unknown as Record<string, unknown>));
  });

  fastify.delete("/fuel-entries/:id", auth, async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const { id } = request.params as { id: string };
    const existing = await prisma.fuelEntry.findFirst({ where: { id, userId } });
    if (!existing) return reply.status(404).send({ error: "Não encontrado" });
    await prisma.fuelEntry.delete({ where: { id } });
    return reply.status(204).send();
  });
}
