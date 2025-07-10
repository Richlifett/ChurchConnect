import React from 'react';
import { Monitor } from 'lucide-react';

export function ScreenShare() {
  return (
    <div className="h-full bg-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Monitor className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-white text-xl font-semibold mb-2">Screen Sharing Active</h3>
        <p className="text-gray-300">Pastor Mike is sharing their screen</p>
      </div>
    </div>
  );
}