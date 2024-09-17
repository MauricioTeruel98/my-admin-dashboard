import React from 'react';

const CreativeLoader = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
      <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-4 h-4 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
};

export default CreativeLoader;