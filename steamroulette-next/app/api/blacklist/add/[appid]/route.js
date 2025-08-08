import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(_request, { params }) {
  const session = await getSession();
  if (!session.steam_id) return new Response('Unauthorized', { status: 401 });
  const appid = parseInt(params.appid, 10);
  if (!appid) return new Response('Bad Request', { status: 400 });

  await prisma.blacklistedGame.upsert({
    where: { steamId_appid: { steamId: session.steam_id, appid } },
    update: {},
    create: { steamId: session.steam_id, appid },
  });
  return Response.json({ status: 'success' });
}