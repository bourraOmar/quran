interface ApkFileIconProps {
  className?: string;
}

export default function ApkFileIcon({ className = "w-5 h-5" }: ApkFileIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 128 128"
      fill="none"
      stroke="currentColor"
      strokeWidth={6.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Document outline */}
      <path d="M 38 48 V 20 C 38 13.4 43.4 8 50 8 H 86 L 118 40 V 106 C 118 112.6 112.6 118 106 118 H 50 C 43.4 118 38 112.6 38 106 V 96" />
      
      {/* Folded corner flap */}
      <path d="M 86 8 V 34 C 86 37.3 88.7 40 92 40 H 118" />
      
      {/* APK Badge Box */}
      <rect x="9" y="48" width="81" height="48" rx="12" />
      
      {/* Letter A */}
      <path d="M 22 84 L 32.5 60 L 43 84" />
      <path d="M 26 75.5 H 39" />
      
      {/* Letter P */}
      <path d="M 53 84 V 60 H 61.5 C 67.5 60 67.5 72 61.5 72 H 53" />
      
      {/* Letter K */}
      <path d="M 74 60 V 84" />
      <path d="M 85.5 60 L 74 71.5 L 85.5 84" />
    </svg>
  );
}
