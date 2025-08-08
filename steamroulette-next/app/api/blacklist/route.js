import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session.steam_id) return new Response('Unauthorized', { status: 401 });

  const rows = await prisma.blacklistedGame.findMany({ where: { steamId: session.steam_id } });
  const appids = rows.map((r) => r.appid);
  if (appids.length === 0) return Response.json([]);

  const results = await Promise.all(appids.map(async (appid) => {
    try {
      const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}`);
      const data = await res.json();
      const key = String(appid);
      if (data?.[key]?.success) {
        const d = data[key].data;
        return { appid, name: d?.name || 'Unknown Game', image_url: d?.header_image || '' };
      }
    } catch {}
    return { appid, name: 'Unknown Game', image_url: '' };
  }));

  return Response.json(results);
}

export async function POST(request) {
  const session = await getSession();
  if (!session.steam_id) return new Response('Unauthorized', { status: 401 });
  const body = await request.json();
  const appid = parseInt(body.appid, 10);
  if (!appid) return new Response('Bad Request', { status: 400 });

  await prisma.blacklistedGame.deleteMany({ where: { steamId: session.steam_id, appid } });
  return Response.json({ status: 'success' });
}