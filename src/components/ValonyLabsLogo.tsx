interface ValonyLabsLogoProps {
  className?: string;
  size?: number;
}

export const ValonyLabsLogo = ({ className = "", size = 32 }: ValonyLabsLogoProps) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circle */}
        <circle
          cx="50"
          cy="50"
          r="48"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Inner Geometric Pattern - V Shape */}
        <path
          d="M25 30 L50 70 L75 30"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Center Dot */}
        <circle
          cx="50"
          cy="50"
          r="4"
          fill="currentColor"
        />
        
        {/* Additional Elements */}
        <circle
          cx="35"
          cy="35"
          r="2"
          fill="currentColor"
          opacity="0.7"
        />
        <circle
          cx="65"
          cy="35"
          r="2"
          fill="currentColor"
          opacity="0.7"
        />
      </svg>
    </div>
  );
};