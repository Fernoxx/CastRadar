import React from 'react';

export interface ChannelBoxProps {
  rank?: number;
  channel: string;
  total: number;
  cast: string;
  likes: number;
  author: string;
  hash: string;
  isGlobalMostLiked?: boolean;
}

export function ChannelBox({ 
  rank, 
  channel, 
  total, 
  cast, 
  likes, 
  author, 
  hash,
  isGlobalMostLiked = false
}: ChannelBoxProps) {
  const truncatedCast = cast.length > 150 ? `${cast.substring(0, 150)}...` : cast;
  
  return (
    <div className="bg-white rounded-2xl p-4 shadow-md mb-4 hover:shadow-lg transition-shadow duration-200">
      {rank && rank > 0 && (
        <div className="flex items-center justify-between mb-2">
          <a
            href={`https://warpcast.com/~/channel/${channel}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-700 font-bold text-lg hover:text-purple-800 transition-colors"
          >
            #{rank} /{channel}
          </a>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {total} casts today
          </span>
        </div>
      )}

      {isGlobalMostLiked && (
        <div className="text-purple-700 font-bold text-lg mb-2">
          🏆 Most Liked Cast Overall
        </div>
      )}

      {!rank && !isGlobalMostLiked && channel && (
        <a
          href={`https://warpcast.com/~/channel/${channel}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-700 font-bold text-lg hover:text-purple-800 transition-colors block mb-2"
        >
          /{channel}
        </a>
      )}

      {cast && (
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-500 font-bold">❤️ {likes}</span>
            {author && (
              <span className="text-gray-600 text-sm">
                by @{author}
              </span>
            )}
          </div>
          
          <a
            href={hash ? `https://warpcast.com/${author}/${hash.substring(0, 10)}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-gray-800 text-sm leading-relaxed hover:text-purple-700 transition-colors"
          >
            "{truncatedCast}"
          </a>
        </div>
      )}

      {!cast && (
        <div className="text-gray-500 text-sm mt-2">
          No casts available
        </div>
      )}
    </div>
  );
}
