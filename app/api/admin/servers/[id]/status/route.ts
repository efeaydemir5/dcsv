import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

const ADMIN_IDS = new Set(["970137597332557876"]);

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = (session?.user as any)?.id;
  if (!userId || !ADMIN_IDS.has(String(userId))) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 403 });
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const status = body?.status as "ACTIVE" | "REJECTED" | "BANNED" | "PENDING";
  if (!status) return new Response(JSON.stringify({ error: "status_required" }), { status: 400 });

  // Find by discordId (preferred) fallback to cuid id
  let server = await prisma.server.findUnique({ where: { discordId: id } });
  if (!server) server = await prisma.server.findUnique({ where: { id } });
  if (!server) return new Response(JSON.stringify({ error: "not_found" }), { status: 404 });

  const updated = await prisma.server.update({
    where: { id: server.id },
    data: { status },
  });

  return Response.json({ ok: true, server: updated });
}

