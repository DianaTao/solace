'use client';

import React from 'react';

export const Textarea = React.forwardRef(({ 
  className = '', 
  ...props 
}, ref) => {
  return (
    <textarea
      ref={ref}
      className={`
        flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 
        text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 
        focus:ring-emerald-500 focus:border-emerald-500 disabled:cursor-not-allowed 
        disabled:opacity-50 resize-none
        ${className}
      `}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea'; 