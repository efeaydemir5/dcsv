import prisma from "@/lib/prisma";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  // Auth: either BOT_TOKEN header or ownerDiscordId in body must match
  const botToken = req.headers.get("x-bot-token") || process.env["BOT_TOKEN"];
  const body = await req.json().catch(() => ({}));

  // Try find by primary id; if not found, try by discordId for convenience
  let server = await prisma.server.findUnique({ where: { id } });
  if (!server) {
    server = await prisma.server.findUnique({ where: { discordId: id } as any });
  }
  if (!server) return new Response(JSON.stringify({ error: "Server not found" }), { status: 404 });

  // Must be registered/active before bump
  if (server.status !== "ACTIVE") {
    return new Response(JSON.stringify({ error: "Server is not active yet" }), { status: 400 });
  }

  const isBot = botToken && botToken === process.env["BOT_TOKEN"];
  const isOwner = body.ownerDiscordId && body.ownerDiscordId === server.ownerDiscordId;

  if (!isBot && !isOwner) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 403 });
  }

  // 2-hour cooldown
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
  const last = server.bumpedAt ? new Date(server.bumpedAt).getTime() : 0;
  const now = Date.now();
  const remainingMs = TWO_HOURS_MS - (now - last);
  if (remainingMs > 0) {
    return new Response(
      JSON.stringify({
        error: "cooldown",
        remainingMs,
      }),
      { status: 429 }
    );
  }

  const updated = await prisma.server.update({
    where: { id: server.id },
    data: { bumpedAt: new Date(), isFeatured: body.markFeatured === true ? true : server.isFeatured },
  });

  return Response.json({ ok: true, server: updated });
}
