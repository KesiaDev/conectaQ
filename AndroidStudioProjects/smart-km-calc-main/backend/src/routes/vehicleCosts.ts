import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";

function toSnake(cost: Record<string, unknown>) {
  return {
    id: cost.id,
    user_id: cost.userId,
    category: cost.category,
    description: cost.description,
    amount: cost.amount,
    date: cost.date,
    created_at: cost.createdAt,
  };
}

export default async function vehicleCostsRoutes(fastify: FastifyInstance) {
  const auth = { preHandler: [fastify.authenticate] };

  fastify.get("/vehicle-costs", auth, async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const costs = await prisma.vehicleCost.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
    return reply.send(costs.map(toSnake));
  });

  fastify.post("/vehicle-costs", auth, async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const body = request.body as Record<string, unknown>;
    const cost = await prisma.vehicleCost.create({
      data: {
        userId,
        category: (body.category as string) || "manutencao",
        description: body.description as string | undefined,
        amount: body.amount as number,
      },
    });
    return reply.status(201).send(toSnake(cost as unknown as Record<string, unknown>));
  });

  fastify.delete("/vehicle-costs/:id", auth, async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const { id } = request.params as { id: string };
    const existing = await prisma.vehicleCost.findFirst({ where: { id, userId } });
    if (!existing) return reply.status(404).send({ error: "Não encontrado" });
    await prisma.vehicleCost.delete({ where: { id } });
    return reply.status(204).send();
  });
}
