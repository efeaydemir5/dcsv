import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";

// Redirects user to Discord OAuth2 bot authorization for a specific guild.
// User must have Manage Guild permission in that guild.
export async function GET(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user) return new Response("unauthorized", { status: 401 });

  const url = new URL(req.url);
  const guildId = url.searchParams.get("guildId");
  if (!guildId) return new Response("guildId is required", { status: 400 });

  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) return new Response("DISCORD_CLIENT_ID missing", { status: 500 });

  // Redirect back to our callback endpoint
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/discord/bot/callback`;

  // Permissions bitfield:
  // View Channels (1024) + Create Instant Invite (1) = 1025
  const permissions = "1025";

  const authorizeUrl = new URL("https://discord.com/api/oauth2/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "bot");
  authorizeUrl.searchParams.set("permissions", permissions);
  authorizeUrl.searchParams.set("guild_id", guildId);
  authorizeUrl.searchParams.set("disable_guild_select", "true");

  // We use state to carry guildId back.
  authorizeUrl.searchParams.set("state", guildId);

  return Response.redirect(authorizeUrl.toString());
}
