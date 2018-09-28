import React from 'react';

// based on https://codesandbox.io/s/github/jaredpalmer/react-suspense-router-demo
export default function Spinner() {
  return (
    <div className="spinner">
      <span aria-label="spinner" role="img">
        🌀
      </span>
    </div>
  );
}
