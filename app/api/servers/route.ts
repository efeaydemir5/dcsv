import prisma from "@/lib/prisma";

async function createInviteLink(guildId: string) {
  const botToken = process.env.DISCORD_TOKEN;
  if (!botToken) return null;

  // 1) Find a text channel where bot can create invite
  const channelsRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
    headers: { Authorization: `Bot ${botToken}` },
  });
  if (!channelsRes.ok) return null;
  const channels = (await channelsRes.json().catch(() => [])) as any[];
  const channel = channels.find((c) => c.type === 0) ?? channels[0];
  if (!channel?.id) return null;

  // 2) Create invite
  const inviteRes = await fetch(`https://discord.com/api/v10/channels/${channel.id}/invites`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ max_age: 0, max_uses: 0, temporary: false, unique: true }),
  });
  if (!inviteRes.ok) return null;
  const invite = await inviteRes.json().catch(() => null);
  if (!invite?.code) return null;
  return `https://discord.gg/${invite.code}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || undefined;
  const tag = url.searchParams.get("tag") || undefined;
  const featured = url.searchParams.get("featured") === "true";
  const mine = url.searchParams.get("mine") === "true";
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "12", 10);

  const where: any = {};

  // Only list ACTIVE servers publicly
  where.status = "ACTIVE";

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (tag) {
    // tags stored as JSON array — check contained
    where.tags = {
      path: [],
      array_contains: [tag],
    } as any;
  }

  if (featured) where.isFeatured = true;

  if (mine) {
    // Filter by session user id
    // (Keeping auth in this handler keeps client side simple)
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("../auth/[...nextauth]/authOptions");
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user) return Response.json({ data: [] }, { status: 401 });
    // For "mine" view, allow seeing all statuses
    delete where.status;
    where.ownerDiscordId = (session.user as any).id;
  }

  const servers = await prisma.server.findMany({
    where,
    orderBy: [
      { isFeatured: "desc" },
      { bumpedAt: "desc" },
      { membersCount: "desc" },
    ],
    skip: (page - 1) * limit,
    take: limit,
  });

  return Response.json({ data: servers });
}

export async function POST(req: Request) {
  const body = await req.json();

  // Allow bot to add servers without a logged-in browser session
  const botHeader = req.headers.get("x-bot-token");
  const expectedBotToken = process.env.BOT_TOKEN;
  const isBotCall = !!expectedBotToken && !!botHeader && botHeader === expectedBotToken;

  // Basic validation
  if (!body.discordId || !body.name || !body.ownerDiscordId) {
    return new Response(JSON.stringify({ error: "discordId, name and ownerDiscordId are required" }), { status: 400 });
  }

  if (!isBotCall) {
    return new Response(JSON.stringify({ error: "unauthorized (bot token missing)" }), { status: 401 });
  }

  const shortDesc = (body.shortDesc ?? body.description ?? "") as string;
  const longDesc = (body.longDesc ?? "") as string;
  if (typeof shortDesc !== "string" || shortDesc.trim().length < 60) {
    return new Response(JSON.stringify({ error: "shortDesc_min_60" }), { status: 400 });
  }
  if (typeof longDesc !== "string" || longDesc.trim().length < 180) {
    return new Response(JSON.stringify({ error: "longDesc_min_180" }), { status: 400 });
  }

  // Fetch guild info via bot (bot must be in the guild)
  const botToken = process.env.DISCORD_TOKEN;
  if (!botToken) {
    return new Response(JSON.stringify({ error: "DISCORD_TOKEN (bot token) is required on server to auto-fetch guild info" }), { status: 500 });
  }

  const guildRes = await fetch(`https://discord.com/api/v10/guilds/${body.discordId}?with_counts=true`, {
    headers: { Authorization: `Bot ${botToken}` },
  });
  if (!guildRes.ok) {
    return new Response(JSON.stringify({ error: "Bot cannot access guild. Is the bot added to the server?" }), { status: 403 });
  }
  const guild = await guildRes.json();

  const bannerUrl = guild.banner ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png?size=1024` : null;
  const boostCount = typeof guild.premium_subscription_count === "number" ? guild.premium_subscription_count : null;

  const invite = await createInviteLink(body.discordId);

  // Upsert to avoid unique constraint crash if server already exists
  const upserted = await prisma.server.upsert({
    where: { discordId: body.discordId },
    create: {
      discordId: body.discordId,
      name: guild.name ?? body.name,
      description: shortDesc,
      shortDesc: shortDesc,
      longDesc: longDesc,
      invite,
      category: body.category ?? null,
      ownerDiscordId: body.ownerDiscordId,
      membersCount: guild.approximate_member_count ?? null,
      presenceCount: guild.approximate_presence_count ?? null,
      boostCount,
      bannerUrl,
      tags: body.tags ?? null,
      avatarUrl: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
      status: "PENDING",
    },
    update: {
      name: guild.name ?? body.name,
      description: shortDesc,
      shortDesc: shortDesc,
      longDesc: longDesc,
      invite,
      membersCount: guild.approximate_member_count ?? null,
      presenceCount: guild.approximate_presence_count ?? null,
      boostCount,
      bannerUrl,
      avatarUrl: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
      ownerDiscordId: body.ownerDiscordId,
      status: "PENDING",
    },
  });

  return Response.json({ ok: true, server: upserted });
}
