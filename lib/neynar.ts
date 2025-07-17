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
  // Return static list of popular channels since trending endpoint might not work
  return ['memes', 'crypto', 'degen', 'base', 'founders', 'art', 'music', 'tech'];
}

export async function getChannelCasts(channelId: string, limit: number = 25): Promise<Cast[]> {
  try {
    console.log(`Fetching casts for channel: ${channelId}`);
    
    const response = await fetch(
      `${BASE_URL}/feed/channels?channel_ids=${channelId}&limit=${limit}&with_recasts=false`,
      { headers }
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch casts for channel ${channelId}:`, response.status, response.statusText);
      
      // Try alternative endpoint
      const altResponse = await fetch(
        `${BASE_URL}/feed?filter_type=channel_id&channel_id=${channelId}&limit=${limit}`,
        { headers }
      );
      
      if (!altResponse.ok) {
        console.error(`Alternative endpoint also failed for ${channelId}`);
        return [];
      }
      
      const altData = await altResponse.json() as any;
      return altData.casts || [];
    }
    
    const data = await response.json() as any;
    console.log(`Got ${data.casts?.length || 0} casts for channel ${channelId}`);
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
