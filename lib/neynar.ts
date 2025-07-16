const base = 'https://api.neynar.com/v2/farcaster';
const headers = {
  'accept': 'application/json',
  'x-api-key': process.env.NEYNAR_API_KEY!
};

export async function getChannelCasts(channel: string, limit = 50) {
  const res = await fetch(
    `${base}/channel-casts?channel_id=${channel}&limit=${limit}`,
    { headers }
  );
  return res.json();
}

export async function getReactions(castHash: string) {
  const res = await fetch(
    `${base}/reactions/cast?hash=${castHash}&types=likes`,
    { headers }
  );
  return res.json();
}
