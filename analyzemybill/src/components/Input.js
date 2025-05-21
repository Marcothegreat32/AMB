import React from 'react';

export default function Input(props) {
  return (
    <input
      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary font-body"
      {...props}
    />
  );
}
