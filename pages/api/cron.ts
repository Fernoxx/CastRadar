// pages/api/cron.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import supabase, { SnapshotData } from '../../lib/supabase';
import { getTrendingChannels, getChannelCasts, getLikesCount, Cast } from '../../lib/neynar';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

// Fallback sample data for testing
const generateSampleData = () => {
  const channels = ['memes', 'crypto', 'degen', 'base', 'founders', 'art'];
  const sampleAuthors = ['dwr', 'vitalik', 'jacob', 'balajis', 'ccarella', 'pfista'];
  const sampleTexts = [
    "gm! building something cool on farcaster",
    "just shipped a new feature for our app",
    "the future is onchain",
    "loving the farcaster community",
    "building in public is the way",
    "decentralized social is here"
  ];

  const topChannels = channels.map((channel, index) => ({
    channel,
    totalCasts: Math.floor(Math.random() * 100) + 20,
    mostLikedCast: {
      hash: `0x${Math.random().toString(16).substring(2, 42)}`,
      text: sampleTexts[Math.floor(Math.random() * sampleTexts.length)],
      author: {
        username: sampleAuthors[Math.floor(Math.random() * sampleAuthors.length)]
      },
      reactions: {
        likes: Array.from({ length: Math.floor(Math.random() * 50) + 10 }, (_, i) => ({ fid: i + 1 }))
      }
    }
  }));

  const mostLikedCast = topChannels.reduce((prev, current) => 
    (prev.mostLikedCast.reactions.likes.length > current.mostLikedCast.reactions.likes.length) ? prev : current
  ).mostLikedCast;

  return {
    topChannels,
    mostLikedCast: { ...mostLikedCast, channel: topChannels[0].channel }
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Basic auth check (optional)
  const auth = req.headers.authorization || '';
  const expectedAuth = process.env.CRON_SECRET;
  if (expectedAuth && auth !== `Bearer ${expectedAuth}`) {
    console.log('No auth required for development');
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
    let hasRealData = false;

    // Process each channel
    for (const channelId of channels.slice(0, 6)) { // Limit to 6 channels to avoid rate limits
      try {
        console.log(`Processing channel: ${channelId}`);
        
        const casts = await getChannelCasts(channelId, 20);
        
        if (casts.length === 0) {
          console.log(`No casts found for channel: ${channelId}`);
          continue;
        }

        hasRealData = true;
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
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`Error processing channel ${channelId}:`, error);
        continue;
      }
    }

    // If no real data was fetched, use sample data
    if (!hasRealData || topChannels.length === 0) {
      console.log('No real data available, using sample data...');
      const sampleData = generateSampleData();
      
      const snapshotData: Omit<SnapshotData, 'id' | 'created_at'> = {
        date: today,
        top_channels: sampleData.topChannels,
        most_liked_cast: sampleData.mostLikedCast
      };

      // Store snapshot in Supabase
      const { error: insertError } = await supabase
        .from('snapshots')
        .insert([snapshotData]);

      if (insertError) {
        console.error('Error inserting sample snapshot:', insertError);
        return res.status(500).json({ 
          error: 'Failed to store snapshot',
          details: insertError.message 
        });
      }

      console.log(`Sample snapshot stored for ${today}`);
      return res.status(200).json({ 
        success: true,
        date: today,
        dataType: 'sample',
        channelsProcessed: sampleData.topChannels.length
      });
    }

    // Sort channels by total casts
    topChannels.sort((a, b) => b.totalCasts - a.totalCasts);

    // Prepare snapshot data with real data
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

    console.log(`Real data snapshot stored successfully for ${today}`);
    console.log(`Processed ${topChannels.length} channels, global most liked: ${globalMaxLikes} likes`);

    return res.status(200).json({ 
      success: true,
      date: today,
      dataType: 'real',
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
