import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

async function createInviteLink(guildId: string) {
  const botToken = process.env.DISCORD_TOKEN;
  if (!botToken) return null;

  const channelsRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
    headers: { Authorization: `Bot ${botToken}` },
  });
  if (!channelsRes.ok) return null;
  const channels = (await channelsRes.json().catch(() => [])) as any[];
  const channel = channels.find((c) => c.type === 0) ?? channels[0];
  if (!channel?.id) return null;

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

// Discord redirects here after user authorizes bot add-to-guild.
// We don't need to exchange code for bot token; bot token already exists.
// We'll verify bot can access guild and then upsert server record.
export async function GET(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user) return Response.redirect(`${process.env.NEXTAUTH_URL}/add-server?error=unauthorized`);

  const url = new URL(req.url);
  const guildId = url.searchParams.get("guild_id") || url.searchParams.get("state");
  if (!guildId) return Response.redirect(`${process.env.NEXTAUTH_URL}/add-server?error=missing_guild`);

  const botToken = process.env.DISCORD_TOKEN;
  if (!botToken) return Response.redirect(`${process.env.NEXTAUTH_URL}/add-server?error=missing_bot_token`);

  const guildRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
    headers: { Authorization: `Bot ${botToken}` },
  });
  if (!guildRes.ok) {
    return Response.redirect(`${process.env.NEXTAUTH_URL}/add-server?error=bot_not_in_guild`);
  }
  const guild = await guildRes.json();
  const invite = await createInviteLink(guildId);

  await prisma.server.upsert({
    where: { discordId: guildId },
    create: {
      discordId: guildId,
      name: guild.name,
      description: null,
      invite,
      category: null,
      ownerDiscordId: (session.user as any).id,
      membersCount: guild.approximate_member_count ?? null,
      tags: undefined,
      avatarUrl: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
      status: "ACTIVE",
    },
    update: {
      name: guild.name,
      invite,
      ownerDiscordId: (session.user as any).id,
      membersCount: guild.approximate_member_count ?? null,
      avatarUrl: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
      status: "ACTIVE",
    },
  });

  return Response.redirect(`${process.env.NEXTAUTH_URL}/add-server?success=1`);
}
