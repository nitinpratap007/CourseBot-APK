import React from 'react';

export default function CallButton({ onClick, children = 'Click me', className = '' }) {
  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  );
}
