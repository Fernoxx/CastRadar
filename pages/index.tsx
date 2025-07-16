import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import LoadingRadar from '../components/LoadingRadar';
import { ChannelBox } from '../components/ChannelBox';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: snapshot, error } = await supabase
          .from('snapshots')
          .select('*')
          .eq('date', dayjs().utc().format('YYYY-MM-DD'))
          .single();

        if (error || !snapshot) {
          setLoading(false);
          return;
        }

        setData(snapshot);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <LoadingRadar />;
  if (!data) return <LoadingRadar />;

  return (
    <main className="bg-purple-100 min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">🔥 Today's Trending Channels</h1>
      {data.top_channels.map((channel: any, index: number) => (
        <ChannelBox
          key={channel.channel}
          rank={index + 1}
          channel={channel.channel}
          total={channel.totalCasts}
          cast={channel.bestCast?.text || channel.mostLikedCast?.text || ''}
          likes={channel.bestCast?.reactions?.likes?.length || channel.mostLikedCast?.reactions?.likes?.length || 0}
          author={channel.bestCast?.author?.username || channel.mostLikedCast?.author?.username || ''}
          hash={channel.bestCast?.hash || channel.mostLikedCast?.hash || ''}
        />
      ))}
      <h2 className="text-xl font-bold mt-6 mb-4">❤️ Today's Most Liked Cast</h2>
      <ChannelBox
        rank={0}
        channel={data.most_liked_cast?.channel || ''}
        total={0}
        cast={data.most_liked_cast?.text || ''}
        likes={data.most_liked_cast?.reactions?.likes?.length || data.most_liked_cast?.likes || 0}
        author={data.most_liked_cast?.author?.username || data.most_liked_cast?.author || ''}
        hash={data.most_liked_cast?.hash || ''}
      />
      <a
        href="/history"
        className="inline-block mt-4 px-4 py-2 bg-purple-700 text-white rounded-full shadow"
      >
        View 7-Day History →
      </a>
    </main>
  );
}
