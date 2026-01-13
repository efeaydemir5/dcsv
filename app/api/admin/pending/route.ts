import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

const ADMIN_IDS = new Set(["970137597332557876"]);

export async function GET() {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = (session?.user as any)?.id;
  if (!userId || !ADMIN_IDS.has(String(userId))) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 403 });
  }

  const pending = await prisma.server.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ data: pending });
}

