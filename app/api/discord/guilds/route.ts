import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

export async function GET() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !session.user) {
    return Response.json({ guilds: [] }, { status: 401 });
  }
  const accessToken = (session as any).accessToken || (session as any).user?.accessToken;
  if (!accessToken) return Response.json({ guilds: [] }, { status: 401 });

  const res = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const guilds = await res.json();

  // Only return guilds where user can manage the server.
  // Discord permissions is a stringified integer.
  const MANAGE_GUILD = 0x20;
  const filtered = Array.isArray(guilds)
    ? guilds.filter((g: any) => (BigInt(g.permissions ?? 0) & BigInt(MANAGE_GUILD)) === BigInt(MANAGE_GUILD))
    : [];

  return Response.json({ guilds: filtered });
}
