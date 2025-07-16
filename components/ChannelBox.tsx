import React from 'react';

export function ChannelBox({ rank, channel, total, cast, likes, author, hash }: {
  rank: number;
  channel: string;
  total: number;
  cast: string;
  likes: number;
  author: string;
  hash: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow mb-4">
      <a
        href={`https://warpcast.com/~/channel/${channel}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-700 font-bold"
      >
        #{rank} /{channel}
      </a>
      <p className="text-sm text-gray-500">{total} casts</p>
      <a
        href={`https://warpcast.com/${author}/cast/${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-2 text-gray-800"
      >
        ❤️ {likes} — "{cast}"
      </a>
    </div>
  );
}
