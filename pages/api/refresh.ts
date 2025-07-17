import type { NextRequest } from 'next/server';
import supabase from '../../lib/supabase';
import { getTrendingChannels, getChannelCasts, getLikesCount, Cast } from '../../lib/neynar';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const config = { runtime: 'edge' };

export default async function handler(req: NextRequest) {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const today = dayjs().utc().format('YYYY-MM-DD');
    
    // Get trending channels
    const channels = await getTrendingChannels();
    
    const topChannels: Array<{
      channel: string;
      totalCasts: number;
      mostLikedCast: Cast | null;
    }> = [];

    let globalMostLiked: Cast | null = null;
    let globalMaxLikes = -1;

    // Process each channel
    for (const channelId of channels.slice(0, 6)) { // Limit to avoid timeout
      try {
        const casts = await getChannelCasts(channelId, 30); // Reduced limit for faster processing
        
        if (casts.length === 0) continue;

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
        
      } catch (error) {
        console.error(`Error processing channel ${channelId}:`, error);
        continue;
      }
    }

    // Sort channels by total casts
    topChannels.sort((a, b) => b.totalCasts - a.totalCasts);

    // Prepare snapshot data
    const snapshotData = {
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

    // Delete existing snapshot for today if it exists
    await supabase
      .from('snapshots')
      .delete()
      .eq('date', today);

    // Insert new snapshot
    const { error } = await supabase
      .from('snapshots')
      .insert([snapshotData]);

    if (error) {
      console.error('Error storing snapshot:', error);
      return new Response(`Failed to store snapshot: ${error.message}`, { status: 500 });
    }

    // Clean up old snapshots
    const sevenDaysAgo = dayjs().utc().subtract(7, 'day').format('YYYY-MM-DD');
    await supabase
      .from('snapshots')
      .delete()
      .lt('date', sevenDaysAgo);

    return new Response(`Fresh snapshot stored for ${today}`, { status: 200 });

  } catch (error) {
    console.error('Error in refresh API:', error);
    return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}
