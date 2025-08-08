import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  const session = await getSession();
  if (!session.steam_id) return new Response('Unauthorized', { status: 401 });

  const url = new URL(request.url);
  const minPlaytime = parseInt(url.searchParams.get('min_playtime') || '0', 10);
  const apiKey = process.env.STEAM_API_KEY;

  const gamesResponse = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${session.steam_id}&include_appinfo=true&format=json`);
  const gamesData = await gamesResponse.json();

  const blacklisted = await prisma.blacklistedGame.findMany({
    where: { steamId: session.steam_id },
    select: { appid: true },
  });
  const blacklistedIds = new Set(blacklisted.map((g) => g.appid));

  const games = gamesData?.response?.games || [];
  const filtered = games.filter((g) => (g.playtime_forever || 0) >= minPlaytime && !blacklistedIds.has(g.appid));

  if (filtered.length === 0) {
    return Response.json({ error: 'No games match filters' }, { status: 404 });
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  const playtimeHours = (random.playtime_forever || 0) / 60;
  const appid = random.appid;
  const imageUrl = `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/header.jpg`;

  return Response.json({
    appid,
    name: random.name || 'Unknown Game',
    playtime_hours: playtimeHours,
    image_url: imageUrl,
  });
}