// pages/api/cron.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import supabase, { SnapshotData } from '../../lib/supabase';
import { getTrendingChannels, getChannelCasts, getLikesCount, Cast } from '../../lib/neynar';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Basic auth check (optional)
  const auth = req.headers.authorization || '';
  const expectedAuth = process.env.CRON_SECRET;
  if (expectedAuth && auth !== `Bearer ${expectedAuth}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Starting daily snapshot generation...');
    
    const today = dayjs().utc().format('YYYY-MM-DD');
    
    // Check if snapshot already exists for today
    const { data: existingSnapshot } = await supabase
      .from('snapshots')
      .select('id')
      .eq('date', today)
      .single();

    if (existingSnapshot) {
      console.log(`Snapshot already exists for ${today}`);
      return res.status(200).json({ 
        message: `Snapshot already exists for ${today}`,
        date: today 
      });
    }

    // Get trending channels
    const channels = await getTrendingChannels();
    console.log(`Processing ${channels.length} channels:`, channels);

    const topChannels: Array<{
      channel: string;
      totalCasts: number;
      mostLikedCast: Cast | null;
    }> = [];

    let globalMostLiked: Cast | null = null;
    let globalMaxLikes = -1;

    // Process each channel
    for (const channelId of channels.slice(0, 8)) { // Limit to 8 channels to avoid rate limits
      try {
        console.log(`Processing channel: ${channelId}`);
        
        const casts = await getChannelCasts(channelId, 50);
        
        if (casts.length === 0) {
          console.log(`No casts found for channel: ${channelId}`);
          continue;
        }

        let mostLikedCast: Cast | null = null;
        let maxLikes = -1;

        // Find the most liked cast in this channel
        for (const cast of casts) {
          const likes = getLikesCount(cast);
          
          if (likes > maxLikes) {
            maxLikes = likes;
            mostLikedCast = cast;
          }

          // Check if this is the global most liked
          if (likes > globalMaxLikes) {
            globalMaxLikes = likes;
            globalMostLiked = { ...cast, channel: { id: channelId } };
          }
        }

        topChannels.push({
          channel: channelId,
          totalCasts: casts.length,
          mostLikedCast
        });

        console.log(`Channel ${channelId}: ${casts.length} casts, best: ${maxLikes} likes`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error processing channel ${channelId}:`, error);
        continue;
      }
    }

    // Sort channels by total casts
    topChannels.sort((a, b) => b.totalCasts - a.totalCasts);

    // Prepare snapshot data
    const snapshotData: Omit<SnapshotData, 'id' | 'created_at'> = {
      date: today,
      top_channels: topChannels.map(ch => ({
        channel: ch.channel,
        totalCasts: ch.totalCasts,
        mostLikedCast: ch.mostLikedCast ? {
          hash: ch.mostLikedCast.hash,
          text: ch.mostLikedCast.text,
          author: {
            username: ch.mostLikedCast.author.username
          },
          reactions: {
            likes: ch.mostLikedCast.reactions.likes || []
          }
        } : null
      })),
      most_liked_cast: globalMostLiked ? {
        hash: globalMostLiked.hash,
        text: globalMostLiked.text,
        author: {
          username: globalMostLiked.author.username
        },
        reactions: {
          likes: globalMostLiked.reactions.likes || []
        },
        channel: globalMostLiked.channel?.id
      } : null
    };

    // Store snapshot in Supabase
    const { error: insertError } = await supabase
      .from('snapshots')
      .insert([snapshotData]);

    if (insertError) {
      console.error('Error inserting snapshot:', insertError);
      return res.status(500).json({ 
        error: 'Failed to store snapshot',
        details: insertError.message 
      });
    }

    // Clean up old snapshots (keep only last 7 days)
    const sevenDaysAgo = dayjs().utc().subtract(7, 'day').format('YYYY-MM-DD');
    const { error: deleteError } = await supabase
      .from('snapshots')
      .delete()
      .lt('date', sevenDaysAgo);

    if (deleteError) {
      console.error('Error cleaning up old snapshots:', deleteError);
    }

    console.log(`Snapshot stored successfully for ${today}`);
    console.log(`Processed ${topChannels.length} channels, global most liked: ${globalMaxLikes} likes`);

    return res.status(200).json({ 
      success: true,
      date: today,
      channelsProcessed: topChannels.length,
      globalMostLikedLikes: globalMaxLikes
    });

  } catch (error) {
    console.error('Error in cron job:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
