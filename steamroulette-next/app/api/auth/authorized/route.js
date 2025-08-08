import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';

export async function GET(request) {
  const url = new URL(request.url);
  const signed = url.searchParams.get('openid.signed');
  if (!signed) return new NextResponse('Authorization failed.', { status: 400 });

  const params = new URLSearchParams({
    'openid.assoc_handle': url.searchParams.get('openid.assoc_handle') || '',
    'openid.signed': signed,
    'openid.sig': url.searchParams.get('openid.sig') || '',
    'openid.ns': url.searchParams.get('openid.ns') || '',
    'openid.mode': 'check_authentication',
  });

  for (const param of signed.split(',')) {
    const value = url.searchParams.get(`openid.${param}`) || '';
    params.set(`openid.${param}`, value);
  }

  const verify = await fetch(STEAM_OPENID_URL, { method: 'POST', body: params });
  const text = await verify.text();
  if (text.includes('is_valid:true')) {
    const claimedId = url.searchParams.get('openid.claimed_id') || '';
    const steamId = claimedId.split('/').pop();
    const session = await getSession();
    session.steam_id = steamId;
    await session.save();
    return NextResponse.redirect(new URL('/random', request.url));
  }
  return new NextResponse('Authorization failed.', { status: 401 });
}