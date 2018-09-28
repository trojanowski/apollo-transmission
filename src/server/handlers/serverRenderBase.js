import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { ApolloProvider, getDataFromTree } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import React from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { SchemaLink } from 'apollo-link-schema';
import { StaticRouter } from 'react-router-dom';
import { withClientState } from 'apollo-link-state';

import App from '../../shared/App';
import Html from '../components/Html';
import * as clientStateProps from '../../shared/resolvers';
import schema from '../schema';

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

  const rendered = renderToStaticMarkup(
    <Html apolloState={apolloState} content={content} />
  );
  ctx.body = `<!doctype html>${rendered}`;

  if (serverContext.status) {
    ctx.status = serverContext.status;
  }
}
