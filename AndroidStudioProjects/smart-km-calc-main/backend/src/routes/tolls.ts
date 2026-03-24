import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

function toSnake(t: Record<string, unknown>) {
  return {
    id: t.id,
    user_id: t.userId,
    fuel_entry_id: t.fuelEntryId,
    description: t.description,
    amount: t.amount,
    created_at: t.createdAt,
  };
}

export default async function tollsRoutes(fastify: FastifyInstance) {
  const auth = { preHandler: [fastify.authenticate] };

  fastify.get("/tolls", auth, async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const { fuelEntryId } = request.query as { fuelEntryId?: string };
    const tolls = await prisma.toll.findMany({
      where: { userId, ...(fuelEntryId ? { fuelEntryId } : {}) },
      orderBy: { createdAt: "asc" },
    });
    return reply.send(tolls.map((t) => toSnake(t as unknown as Record<string, unknown>)));
  });

  fastify.post("/tolls", auth, async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const body = request.body as Record<string, unknown>;
    const toll = await prisma.toll.create({
      data: {
        userId,
        amount: body.amount as number,
        description: body.description as string | undefined,
        fuelEntryId: body.fuel_entry_id as string | undefined,
      },
    });
    return reply.status(201).send(toSnake(toll as unknown as Record<string, unknown>));
  });

  fastify.put("/tolls/:id", auth, async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    const existing = await prisma.toll.findFirst({ where: { id, userId } });
    if (!existing) return reply.status(404).send({ error: "Não encontrado" });
    const toll = await prisma.toll.update({
      where: { id },
      data: {
        ...(body.amount !== undefined && { amount: body.amount as number }),
        ...(body.description !== undefined && { description: body.description as string }),
        ...(body.fuel_entry_id !== undefined && { fuelEntryId: body.fuel_entry_id as string }),
      },
    });
    return reply.send(toSnake(toll as unknown as Record<string, unknown>));
  });

  fastify.delete("/tolls/:id", auth, async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const { id } = request.params as { id: string };
    const existing = await prisma.toll.findFirst({ where: { id, userId } });
    if (!existing) return reply.status(404).send({ error: "Não encontrado" });
    await prisma.toll.delete({ where: { id } });
    return reply.status(204).send();
  });
}
