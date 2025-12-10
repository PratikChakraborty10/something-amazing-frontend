"use client";

interface DottedBackgroundProps {
  className?: string;
}

export function DottedBackground({ className }: DottedBackgroundProps) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <div className="absolute inset-0 -z-30 opacity-40 dark:opacity-20">
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="dotted-pattern"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" className="fill-foreground/30" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotted-pattern)" />
        </svg>
      </div>
    </div>
  );
}
