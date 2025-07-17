const BASE_URL = 'https://api.neynar.com/v2/farcaster';
const API_KEY = process.env.NEYNAR_API_KEY!;

const headers = {
  'accept': 'application/json',
  'x-api-key': API_KEY
};

export interface Cast {
  hash: string;
  text: string;
  author: {
    username: string;
    fid: number;
  };
  reactions: {
    likes?: Array<{ fid: number }>;
    recasts?: Array<{ fid: number }>;
  };
  channel?: {
    id: string;
  };
}

export interface ChannelData {
  channel: string;
  totalCasts: number;
  mostLikedCast: Cast | null;
}

export async function getTrendingChannels(): Promise<string[]> {
  try {
    const response = await fetch(`${BASE_URL}/channels/trending`, {
      headers
    });
    
    if (!response.ok) {
      console.error('Failed to fetch trending channels:', response.statusText);
      return ['memes', 'crypto', 'ask', 'tech', 'music', 'art', 'founders', 'gaming'];
    }
    
    const data = await response.json() as any;
    return data.channels?.map((ch: any) => ch.id) || ['memes', 'crypto', 'ask', 'tech', 'music'];
  } catch (error) {
    console.error('Error fetching trending channels:', error);
    return ['memes', 'crypto', 'ask', 'tech', 'music', 'art', 'founders', 'gaming'];
  }
}

export async function getChannelCasts(channelId: string, limit: number = 100): Promise<Cast[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/feed/channels?channel_ids=${channelId}&limit=${limit}&with_recasts=false`,
      { headers }
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch casts for channel ${channelId}:`, response.statusText);
      return [];
    }
    
    const data = await response.json() as any;
    return data.casts || [];
  } catch (error) {
    console.error(`Error fetching casts for channel ${channelId}:`, error);
    return [];
  }
}

export async function getCastReactions(hash: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/reactions/cast?hash=${hash}&types=likes`,
      { headers }
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch reactions for cast ${hash}:`, response.statusText);
      return { reactions: [] };
    }
    
    return await response.json() as any;
  } catch (error) {
    console.error(`Error fetching reactions for cast ${hash}:`, error);
    return { reactions: [] };
  }
}

export function getLikesCount(cast: Cast): number {
  return cast.reactions?.likes?.length || 0;
}
