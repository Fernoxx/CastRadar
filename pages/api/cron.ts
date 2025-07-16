// pages/api/cron.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getChannelCasts, getReactions } from '../../lib/neynar'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

// inline Supabase client — no external module import
const supabase = createClient(
  process.env.SUPABASE_URL! ,
  process.env.SUPABASE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end('Method Not Allowed')
  }

  // auth check
  const auth = req.headers.authorization || ''
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized')
  }

  const CHANNELS = ['memes','crypto','ask','tech','music']
  const today = dayjs().utc().format('YYYY-MM-DD')
  const topChannels: any[] = []
  let globalMostLiked: any = null

  for (const ch of CHANNELS) {
    const data = await getChannelCasts(ch, 100) as any
    if (!data.casts) continue

    let best: any = null
    let maxLikes = -1

    for (const cast of data.casts) {
      const likes = cast.reactions?.likes?.length || 0
      if (likes > maxLikes) {
        maxLikes = likes
        best = cast
      }
      
      if (!globalMostLiked || likes > (globalMostLiked.reactions?.likes?.length || 0)) {
        globalMostLiked = cast
      }
    }

    if (best) {
      topChannels.push({
        channel: ch,
        totalCasts: data.casts.length,
        bestCast: best
      })
    }
  }

  // store & prune
  await supabase
    .from('snapshots')
    .insert([{ date: today, top_channels: topChannels, most_liked_cast: globalMostLiked }])

  await supabase
    .from('snapshots')
    .delete()
    .lt('date', dayjs().utc().subtract(7, 'day').format('YYYY-MM-DD'))

  return res.status(200).json({ ok: true, date: today })
}
