'use client';

import React from 'react';

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 ease-in-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
));

Progress.displayName = 'Progress';

export { Progress }; 