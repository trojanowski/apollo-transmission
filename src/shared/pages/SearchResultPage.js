import { Query } from 'react-apollo';
import React from 'react';
import gql from 'graphql-tag';
import queryString from 'query-string';

import NotFound from '../components/NotFound';
import PostList from '../components/PostList';

export default class SearchResultPageWithData extends React.Component {
  render() {
    const parsedQuery = queryString.parse(this.props.location.search);
    if (!parsedQuery.q) {
      return <NotFound />;
    }

    return (
      <Query
        query={gql`
          query SearchQuery($phrase: String!, $before: String) {
            search(phrase: $phrase, first: 5, before: $before)
              @connection(key: "search", filter: ["phrase"]) {
              ...PostListFragment
            }
          }
          ${PostList.fragments.postList}
        `}
        variables={{ phrase: parsedQuery.q }}
      >
        {({ data, fetchMore, loading }) => (
          <PostList
            data={data}
            fetchMore={fetchMore}
            getPosts={currentData => currentData.search}
            loading={loading}
          />
        )}
      </Query>
    );
  }
}
