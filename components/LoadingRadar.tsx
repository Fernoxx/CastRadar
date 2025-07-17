'use client';

export default function LoadingRadar() {
  return (
    <div className="bg-purple-100 min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📱 CastRadar</h1>
      </div>
      
      <div className="radar" />
      
      <style jsx>{`
        .radar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          position: relative;
          background: radial-gradient(circle, rgba(0, 255, 0, 0.15) 30%, transparent 31%),
                      conic-gradient(rgba(0, 255, 0, 0.2), transparent 60%);
          animation: rotate 2s linear infinite;
          box-shadow: 0 0 12px rgba(0, 255, 0, 0.6);
        }

        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .radar::before, .radar::after {
          content: '';
          position: absolute;
          background: #0f0;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .radar::before {
          width: 6px;
          height: 6px;
          top: 20%;
          left: 20%;
          animation-delay: 0.2s;
        }

        .radar::after {
          width: 8px;
          height: 8px;
          bottom: 15%;
          right: 15%;
          animation-delay: 0.6s;
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(0.7); 
            opacity: 0.2; 
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
