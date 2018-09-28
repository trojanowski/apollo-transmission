import { Query } from 'react-apollo';
import React from 'react';
import gql from 'graphql-tag';

import PostList from '../components/PostList';

const ALL_POSTS_QUERY = gql`
  query AllPostsQuery($before: String) {
    posts(last: 20, before: $before) @connection(key: "posts") {
      ...PostListFragment
    }
  }
  ${PostList.fragments.postList}
`;

class AllPostsPage extends React.Component {
  render() {
    const { data, fetchMore, loading } = this.props;

    return (
      <PostList
        data={data}
        fetchMore={fetchMore}
        getPosts={currentData => currentData.posts}
        loading={loading}
      />
    );
  }
}

export default class AllPostsPageWithData extends React.Component {
  render() {
    return (
      <Query notifyOnNetworkStatusChange query={ALL_POSTS_QUERY}>
        {({ data, fetchMore, loading }) => (
          <AllPostsPage data={data} fetchMore={fetchMore} loading={loading} />
        )}
      </Query>
    );
  }
}
