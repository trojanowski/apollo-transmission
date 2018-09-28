import React from 'react';

import Status from './Status';

export default function NotFound() {
  return (
    <Status code={404}>
      <p>Not found</p>
    </Status>
  );
}
