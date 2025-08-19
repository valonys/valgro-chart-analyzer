interface ValonyLabsLogoProps {
  className?: string;
}

export const ValonyLabsLogo = ({ className = "w-16 h-16" }: ValonyLabsLogoProps) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-30 blur-md animate-pulse"></div>
      
      {/* Main logo container */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-400/50 flex items-center justify-center shadow-lg">
        {/* Inner decorative ring */}
        <div className="absolute inset-2 rounded-full border border-purple-300/30"></div>
        
        {/* Eye design */}
        <div className="relative">
          {/* Outer eye shape */}
          <div className="w-8 h-5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-inner">
            {/* Pupil */}
            <div className="w-4 h-4 bg-gradient-to-br from-slate-900 to-black rounded-full flex items-center justify-center">
              {/* Inner highlight */}
              <div className="w-2 h-2 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full opacity-80"></div>
              {/* Pupil highlight */}
              <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full opacity-60"></div>
            </div>
          </div>
          
          {/* Mystical symbols around the eye */}
          <div className="absolute -top-1 -left-1 text-purple-300 text-xs opacity-70">✦</div>
          <div className="absolute -top-1 -right-1 text-blue-300 text-xs opacity-70">✧</div>
          <div className="absolute -bottom-1 -left-1 text-blue-300 text-xs opacity-70">✦</div>
          <div className="absolute -bottom-1 -right-1 text-purple-300 text-xs opacity-70">✧</div>
        </div>
      </div>
    </div>
  );
};