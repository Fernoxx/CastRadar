import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import LoadingRadar from '../components/LoadingRadar';
import { ChannelBox } from '../components/ChannelBox';
import { ActivityChart } from '../components/ActivityChart';
import dayjs from 'dayjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export default function History() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: snapshots, error } = await supabase
          .from('snapshots')
          .select('*')
          .order('date', { ascending: false })
          .limit(7);

        if (error || !snapshots) {
          setLoading(false);
          return;
        }

        setData(snapshots);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <LoadingRadar />;
  if (!data.length) return <LoadingRadar />;

  const chartData = data.map((snap: any) => ({
    date: snap.date,
    casts: snap.top_channels.reduce((sum: number, c: any) => sum + c.totalCasts, 0)
  }));

  return (
    <main className="bg-purple-100 min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">📆 Last 7 Days</h1>
      <ActivityChart data={chartData} />
      {data.map((snap: any) => (
        <div key={snap.date} className="bg-white rounded-2xl p-4 shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">{snap.date}</h2>
          {snap.top_channels.map((c: any, i: number) => (
            <ChannelBox
              key={`${snap.date}-${c.channel}`}
              rank={i + 1}
              channel={c.channel}
              total={c.totalCasts}
              cast={c.bestCast?.text || c.mostLikedCast?.text || ''}
              likes={c.bestCast?.reactions?.likes?.length || c.mostLikedCast?.reactions?.likes?.length || 0}
              author={c.bestCast?.author?.username || c.mostLikedCast?.author?.username || ''}
              hash={c.bestCast?.hash || c.mostLikedCast?.hash || ''}
            />
          ))}
          <h3 className="font-semibold mt-4">🏆 Most Liked:</h3>
          <ChannelBox
            rank={0}
            channel={snap.most_liked_cast?.channel || ''}
            total={0}
            cast={snap.most_liked_cast?.text || ''}
            likes={snap.most_liked_cast?.reactions?.likes?.length || snap.most_liked_cast?.likes || 0}
            author={snap.most_liked_cast?.author?.username || snap.most_liked_cast?.author || ''}
            hash={snap.most_liked_cast?.hash || ''}
          />
        </div>
      ))}
      <a
        href="/"
        className="inline-block mt-2 px-4 py-2 bg-purple-700 text-white rounded-full shadow"
      >
        ← Back to Today
      </a>
    </main>
  );
}
