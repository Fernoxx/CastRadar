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

interface SnapshotData {
  id: number;
  date: string;
  top_channels: ChannelData[];
  most_liked_cast: MostLikedCast | null;
  created_at: string;
}

export default function Home() {
  const [data, setData] = useState<SnapshotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const today = dayjs().utc().format('YYYY-MM-DD');
        
        const { data: snapshot, error: fetchError } = await supabase
          .from('snapshots')
          .select('*')
          .eq('date', today)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // No snapshot found for today
            setError('No data available for today. The daily snapshot may not have been generated yet.');
          } else {
            setError(`Failed to fetch data: ${fetchError.message}`);
          }
          setLoading(false);
          return;
        }

        if (!snapshot) {
          setError('No snapshot data found for today.');
          setLoading(false);
          return;
        }

        setData(snapshot);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
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
            <h1 className="text-2xl font-bold mb-4 text-gray-800">📱 CastRadar</h1>
            <div className="text-red-500 mb-4">⚠️ {error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-700 text-white rounded-full hover:bg-purple-800 transition-colors"
            >
              Try Again
            </button>
            <div className="mt-4">
              <a
                href="/history"
                className="text-purple-700 hover:text-purple-800 transition-colors"
              >
                View 7-Day History →
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="bg-purple-100 min-h-screen p-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">📱 CastRadar</h1>
            <p className="text-gray-600 mb-4">No data available for today.</p>
            <a
              href="/history"
              className="inline-block px-4 py-2 bg-purple-700 text-white rounded-full hover:bg-purple-800 transition-colors"
            >
              View 7-Day History →
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-purple-100 min-h-screen p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📱 CastRadar</h1>
          <p className="text-gray-600">Today's Farcaster Activity • {dayjs().format('MMM D, YYYY')}</p>
        </header>

        {/* Trending Channels Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">🔥 Today's Trending Channels</h2>
          {data.top_channels && data.top_channels.length > 0 ? (
            data.top_channels.map((channel, index) => (
              <ChannelBox
                key={channel.channel}
                rank={index + 1}
                channel={channel.channel}
                total={channel.totalCasts}
                cast={channel.mostLikedCast?.text || ''}
                likes={channel.mostLikedCast?.reactions?.likes?.length || 0}
                author={channel.mostLikedCast?.author?.username || ''}
                hash={channel.mostLikedCast?.hash || ''}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-md text-center text-gray-500">
              No trending channels data available
            </div>
          )}
        </section>

        {/* Most Liked Cast Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">❤️ Today's Most Liked Cast</h2>
          {data.most_liked_cast ? (
            <ChannelBox
              channel={data.most_liked_cast.channel || ''}
              total={0}
              cast={data.most_liked_cast.text}
              likes={data.most_liked_cast.reactions?.likes?.length || 0}
              author={data.most_liked_cast.author?.username || ''}
              hash={data.most_liked_cast.hash}
              isGlobalMostLiked={true}
            />
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-md text-center text-gray-500">
              No most liked cast data available
            </div>
          )}
        </section>

        {/* Navigation */}
        <footer className="text-center">
          <a
            href="/history"
            className="inline-block px-6 py-3 bg-purple-700 text-white rounded-full shadow-md hover:bg-purple-800 transition-all duration-200 hover:shadow-lg"
          >
            View 7-Day History →
          </a>
        </footer>
      </div>
    </main>
  );
}
