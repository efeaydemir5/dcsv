import { NextRequest } from 'next/server';

export async function POST(req: NextRequest, context: any) {
  // Support both Next.js versions that pass params as a plain object
  // and those that pass params as a Promise.
  let id: string | undefined;

  if (context && context.params) {
    const params = context.params;

    // If params is a Promise (some Next.js typings), await it
    if (typeof (params as Promise<{ id: string }> ).then === 'function') {
      try {
        const resolved = await params;
        id = resolved?.id;
      } catch (e) {
        // ignore, will be handled below
      }
    } else {
      id = (params as { id: string }).id;
    }
  }

  // Fallback: try to read id from URL or elsewhere if needed
  if (!id) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing id param' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json().catch(() => null);

    // TODO: replace with your actual business logic using `id` and `body`
    return new Response(JSON.stringify({ ok: true, id, body }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
