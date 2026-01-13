import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const botHeader = req.headers.get("x-bot-token");
  const expectedBotToken = process.env.BOT_TOKEN;
  if (!expectedBotToken || botHeader !== expectedBotToken) {
    return new Response(JSON.stringify({ error: "unauthorized (bot token missing)" }), { status: 401 });
  }

  const body = await req.json();
  const voiceCount = typeof body.voiceCount === "number" ? body.voiceCount : null;
  if (voiceCount === null) {
    return new Response(JSON.stringify({ error: "voiceCount_required" }), { status: 400 });
  }

  const updated = await prisma.server.update({
    where: { discordId: params.id },
    data: { voiceCount },
  });

  return Response.json({ ok: true, voiceCount: updated.voiceCount });
}
