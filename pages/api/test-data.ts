import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../lib/supabase';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const today = dayjs().utc().format('YYYY-MM-DD');
    
    // Delete existing data for today
    await supabase
      .from('snapshots')
      .delete()
      .eq('date', today);

    // Generate sample data
    const sampleChannels = [
      {
        channel: 'memes',
        totalCasts: 87,
        mostLikedCast: {
          hash: '0xa1b2c3d4e5f6789012345678901234567890abcd',
          text: 'when you realize farcaster is the future of social media 🚀',
          author: { username: 'dwr' },
          reactions: { likes: Array.from({ length: 42 }, (_, i) => ({ fid: i + 1 })) }
        }
      },
      {
        channel: 'crypto',
        totalCasts: 64,
        mostLikedCast: {
          hash: '0xb2c3d4e5f6789012345678901234567890abcdef',
          text: 'building the future of decentralized social networks',
          author: { username: 'vitalik' },
          reactions: { likes: Array.from({ length: 38 }, (_, i) => ({ fid: i + 1 })) }
        }
      },
      {
        channel: 'degen',
        totalCasts: 73,
        mostLikedCast: {
          hash: '0xc3d4e5f6789012345678901234567890abcdef12',
          text: 'gm to all the builders in the farcaster ecosystem!',
          author: { username: 'jacob' },
          reactions: { likes: Array.from({ length: 35 }, (_, i) => ({ fid: i + 1 })) }
        }
      },
      {
        channel: 'base',
        totalCasts: 56,
        mostLikedCast: {
          hash: '0xd4e5f6789012345678901234567890abcdef1234',
          text: 'shipping fast and building onchain 🔵',
          author: { username: 'jesse' },
          reactions: { likes: Array.from({ length: 31 }, (_, i) => ({ fid: i + 1 })) }
        }
      },
      {
        channel: 'founders',
        totalCasts: 49,
        mostLikedCast: {
          hash: '0xe5f6789012345678901234567890abcdef12345',
          text: 'the best time to build is now. lets keep shipping!',
          author: { username: 'balajis' },
          reactions: { likes: Array.from({ length: 29 }, (_, i) => ({ fid: i + 1 })) }
        }
      }
    ];

    const mostLikedCast = {
      hash: '0xa1b2c3d4e5f6789012345678901234567890abcd',
      text: 'when you realize farcaster is the future of social media 🚀',
      author: { username: 'dwr' },
      reactions: { likes: Array.from({ length: 42 }, (_, i) => ({ fid: i + 1 })) },
      channel: 'memes'
    };

    const snapshotData = {
      date: today,
      top_channels: sampleChannels,
      most_liked_cast: mostLikedCast
    };

    // Insert the sample data
    const { error } = await supabase
      .from('snapshots')
      .insert([snapshotData]);

    if (error) {
      console.error('Error inserting test data:', error);
      return res.status(500).json({ error: 'Failed to insert test data', details: error.message });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Test data created successfully',
      date: today,
      channels: sampleChannels.length
    });

  } catch (error) {
    console.error('Error in test-data endpoint:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}