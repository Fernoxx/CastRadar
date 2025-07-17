import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import LoadingRadar from '../components/LoadingRadar';
import { ChannelBox } from '../components/ChannelBox';
import { ActivityChart, ChartDataPoint } from '../components/ActivityChart';
import dayjs from 'dayjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

interface MostLikedCast {
  hash: string;
  text: string;
  author: {
    username: string;
  };
  reactions: {
    likes: Array<{ fid: number }>;
  };
  channel?: string;
}

interface ChannelData {
  channel: string;
  totalCasts: number;
  mostLikedCast: {
    hash: string;
    text: string;
    author: {
      username: string;
    };
    reactions: {
      likes: Array<{ fid: number }>;
    };
  } | null;
}

interface HistorySnapshot {
  id: number;
  date: string;
  top_channels: ChannelData[];
  most_liked_cast: MostLikedCast | null;
  created_at: string;
}

export default function History() {
  const [data, setData] = useState<HistorySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const { data: snapshots, error: fetchError } = await supabase
          .from('snapshots')
          .select('*')
          .order('date', { ascending: false })
          .limit(7);

        if (fetchError) {
          setError(`Failed to fetch history: ${fetchError.message}`);
          setLoading(false);
          return;
        }

        if (!snapshots || snapshots.length === 0) {
          setError('No historical data available yet.');
          setLoading(false);
          return;
        }

        setData(snapshots);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching history:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <LoadingRadar />;

  if (error) {
    return (
      <main className="bg-purple-100 min-h-screen p-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">📆 CastRadar History</h1>
            <div className="text-red-500 mb-4">⚠️ {error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-700 text-white rounded-full hover:bg-purple-800 transition-colors mr-2"
            >
              Try Again
            </button>
            <a
              href="/"
              className="inline-block px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
            >
              ← Back to Today
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (!data.length) {
    return (
      <main className="bg-purple-100 min-h-screen p-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">📆 CastRadar History</h1>
            <p className="text-gray-600 mb-4">No historical data available yet.</p>
            <a
              href="/"
              className="inline-block px-4 py-2 bg-purple-700 text-white rounded-full hover:bg-purple-800 transition-colors"
            >
              ← Back to Today
            </a>
          </div>
        </div>
      </main>
    );
  }

  // Prepare chart data
  const chartData: ChartDataPoint[] = data.map((snap) => ({
    date: snap.date,
    casts: snap.top_channels.reduce((sum, c) => sum + c.totalCasts, 0)
  }));

  return (
    <main className="bg-purple-100 min-h-screen p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📆 CastRadar History</h1>
          <p className="text-gray-600">Last {data.length} Days of Farcaster Activity</p>
        </header>

        {/* Activity Chart */}
        <ActivityChart data={chartData} />

        {/* Navigation */}
        <div className="text-center mb-6">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-purple-700 text-white rounded-full shadow-md hover:bg-purple-800 transition-all duration-200 hover:shadow-lg"
          >
            ← Back to Today
          </a>
        </div>

        {/* Daily Snapshots */}
        <section className="space-y-6">
          {data.map((snap) => (
            <div key={snap.date} className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-200 pb-2">
                📅 {dayjs(snap.date).format('dddd, MMMM D, YYYY')}
              </h2>
              
              {/* Top Channels for this day */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">🔥 Top Channels</h3>
                {snap.top_channels && snap.top_channels.length > 0 ? (
                  <div className="space-y-3">
                    {snap.top_channels.slice(0, 3).map((channel, index) => (
                      <ChannelBox
                        key={`${snap.date}-${channel.channel}`}
                        rank={index + 1}
                        channel={channel.channel}
                        total={channel.totalCasts}
                        cast={channel.mostLikedCast?.text || ''}
                        likes={channel.mostLikedCast?.reactions?.likes?.length || 0}
                        author={channel.mostLikedCast?.author?.username || ''}
                        hash={channel.mostLikedCast?.hash || ''}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm italic">No channel data available</div>
                )}
              </div>

              {/* Most Liked Cast for this day */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">🏆 Most Liked Cast</h3>
                {snap.most_liked_cast ? (
                  <ChannelBox
                    channel={snap.most_liked_cast.channel || ''}
                    total={0}
                    cast={snap.most_liked_cast.text}
                    likes={snap.most_liked_cast.reactions?.likes?.length || 0}
                    author={snap.most_liked_cast.author?.username || ''}
                    hash={snap.most_liked_cast.hash}
                    isGlobalMostLiked={true}
                  />
                ) : (
                  <div className="text-gray-500 text-sm italic">No most liked cast data available</div>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Footer Navigation */}
        <footer className="text-center mt-8">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-purple-700 text-white rounded-full shadow-md hover:bg-purple-800 transition-all duration-200 hover:shadow-lg"
          >
            ← Back to Today
          </a>
        </footer>
      </div>
    </main>
  );
}
