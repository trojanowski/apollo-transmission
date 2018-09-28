import React from 'react';
import serializeJavascript from 'serialize-javascript';

export default function Html({ apolloState, content }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="theme-color" content="#000000" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
          integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
          crossOrigin="anonymous"
        />
        <title>Transmission</title>
        <style>{`
body {
  padding-bottom: 2rem;
}

.app-content {
  margin-top: 80px;
}

.header-username {
  padding: 0.5rem;
}

.header-logout-button {
  cursor: pointer;
  background: transparent;
  border: 0;
}

/* based on https://codesandbox.io/s/github/jaredpalmer/react-suspense-router-demo */
@keyframes spinner-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 2rem auto;
  font-size: 50px;
  text-align: center;
  transform-origin: 50% 75%;
  animation: spinner-spin infinite 1s linear;
}
        `}</style>
      </head>
      <body>
        <div id="root" dangerouslySetInnerHTML={{ __html: content }} />
      </body>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__APOLLO_STATE__=${serializeJavascript(apolloState, {
            isJSON: true,
          })};`,
        }}
      />
      <script src="/static/js/bundle.js" />
    </html>
  );
}
