'use client';

export default function LoadingRadar() {
  return (
    <div className="bg-purple-100 min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📱 CastRadar</h1>
        <p className="text-gray-600">Loading Farcaster activity...</p>
      </div>
      
      <div className="radar" />
      
      <div className="mt-6 text-center">
        <div className="animate-pulse text-purple-700 font-medium">
          Scanning the Farcaster network...
        </div>
      </div>
      
      <style jsx>{`
        .radar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          position: relative;
          background: radial-gradient(circle, rgba(124, 58, 237, 0.15) 30%, transparent 31%),
                      conic-gradient(rgba(124, 58, 237, 0.3), transparent 60%);
          animation: rotate 2s linear infinite;
          box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
        }

        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .radar::before, .radar::after {
          content: '';
          position: absolute;
          background: #7c3aed;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .radar::before {
          width: 8px;
          height: 8px;
          top: 25%;
          left: 25%;
          animation-delay: 0.2s;
        }

        .radar::after {
          width: 10px;
          height: 10px;
          bottom: 20%;
          right: 20%;
          animation-delay: 0.6s;
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(0.7); 
            opacity: 0.3; 
          }
          50% { 
            transform: scale(1.3); 
            opacity: 1; 
          }
        }
      `}</style>
    </div>
  );
}
