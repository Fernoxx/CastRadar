import type { NextRequest } from 'next/server';
import supabase from '../../lib/supabase';
import { getChannelCasts, getReactions } from '../../lib/neynar';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const config = { runtime: 'edge' };

export default async function handler(req: NextRequest) {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  // your refresh logic…
  const CHANNELS = ['memes', 'crypto', 'ask', 'tech', 'music'];
  const today = dayjs().utc().format('YYYY-MM-DD');
  const topChannels: any[] = [];
  let globalMostLiked: any = null;

  for (const ch of CHANNELS) {
    const data = await getChannelCasts(ch, 100) as any;
    if (!data.casts) continue;

    let mostLiked = null;
    let maxLikes = -1;

    for (const cast of data.casts) {
      const react = await getReactions(cast.hash) as any;
      const likes = react.reactions?.length ?? 0;
      if (likes > maxLikes) {
        maxLikes = likes;
        mostLiked = cast;
      }
    }

    if (mostLiked) {
      topChannels.push({
        channel: ch,
        totalCasts: data.casts.length,
        mostLikedCast: mostLiked
      });
      
      if (!globalMostLiked || maxLikes > globalMostLiked.maxLikes) {
        globalMostLiked = { ...mostLiked, maxLikes };
      }
    }
  }

  await supabase.from('snapshots').insert([{ date: today, top_channels: topChannels, most_liked_cast: globalMostLiked }]);
  await supabase.from('snapshots').delete().lt('date', dayjs().utc().subtract(7,'day').format('YYYY-MM-DD'));

  return new Response(`Snapshot stored for ${today}`, { status: 200 });
}
