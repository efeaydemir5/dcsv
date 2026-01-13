import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const data = await req.json();

  await prisma.server.create({
    data,
  });

  return Response.json({ ok: true });
}
