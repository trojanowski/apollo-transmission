import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { ApolloProvider, getDataFromTree } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import React from 'react';
import { SchemaLink } from 'apollo-link-schema';
import { StaticRouter } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import serializeJavascript from 'serialize-javascript';
import { withClientState } from 'apollo-link-state';

import App from '../../shared/App';
import * as clientStateProps from '../../shared/resolvers';
import schema from '../schema';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export default async function serverRenderBase(ctx) {
  const schemaLink = new SchemaLink({ schema, context: ctx.graphqlContext });
  const cache = new InMemoryCache();
  const localLink = withClientState({ ...clientStateProps, cache });
  const link = ApolloLink.from([localLink, schemaLink]);

  const client = new ApolloClient({
    ssrMode: true,
    link,
    cache,
  });

  const serverContext = {};

  // The client-side App will instead use <BrowserRouter>
  const tree = (
    <ApolloProvider client={client}>
      <StaticRouter context={serverContext} location={ctx.request.url}>
        <App />
      </StaticRouter>
    </ApolloProvider>
  );

  // fetch graphql data required for server-side rendering
  // https://www.apollographql.com/docs/react/recipes/server-side-rendering.html#getDataFromTree
  await getDataFromTree(tree);

  if (serverContext.url) {
    // redirection happened in one of the components
    ctx.redirect(serverContext.url);
    return;
  }

  // do the actual server-side rendering
  const content = renderToString(tree);
  const apolloState = client.extract();

  const template = await getTemplate();
  const serializedApolloState = serializeJavascript(apolloState, {
    isJSON: true,
  });

  const rendered = template
    .replace('<!-- APP_PLACEHOLDER -->', content)
    .replace(
      '<!-- DATA_PLACEHOLDER -->',
      `<script>window.__APOLLO_STATE__=${serializedApolloState}</script>`
    );

  ctx.body = rendered;

  if (serverContext.status) {
    ctx.status = serverContext.status;
  }
}

async function getTemplate() {
  if (IS_PRODUCTION) {
    throw new Error('To implement');
  }

  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  const fetch = require('node-fetch');
  const response = await fetch('http://127.0.0.1:3050/index.html');
  return response.text();
}
