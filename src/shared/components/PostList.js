import React, { Fragment } from 'react';
import { Waypoint } from 'react-waypoint';
import gql from 'graphql-tag';
import produce from 'immer';

import Post from './Post';
import Spinner from './Spinner';

export default class PostList extends React.Component {
  handleLoadMore = () => {
    const {
      data,
      fetchMore,
      fetchMoreArgs,
      fetchMoreVariables,
      getPosts,
      loading,
    } = this.props;
    if (loading || !fetchMore) {
      return;
    }

    fetchMore({
      ...fetchMoreArgs,
      variables: {
        ...fetchMoreVariables,
        before: getPosts(data).pageInfo.cursor,
      },
      updateQuery(previousResult, { fetchMoreResult }) {
        return produce(previousResult, draft => {
          const oldPosts = getPosts(draft);
          const newPosts = getPosts(fetchMoreResult);
          oldPosts.pageInfo = newPosts.pageInfo;
          oldPosts.nodes = [...oldPosts.nodes, ...newPosts.nodes];
        });
      },
    });
  };

  renderPost = post => {
    return <Post key={post.id} post={post} />;
  };

  render() {
    const { data, getPosts, loading } = this.props;
    const posts = getPosts(data);

    if (!(posts && posts.nodes.length) && !loading) {
      return <p>No posts</p>;
    }
    return (
      <Fragment>
        <div>{posts && posts.nodes.map(this.renderPost)}</div>
        {loading && <Spinner />}
        {posts && posts.pageInfo.hasNextPage && (
          <Waypoint
            key={posts.pageInfo.cursor}
            onEnter={this.handleLoadMore}
            bottomOffset="-400px"
          />
        )}
      </Fragment>
    );
  }
}

PostList.fragments = {
  postList: gql`
    fragment PostListFragment on PostConnection {
      nodes {
        ...PostComponentFragment
      }
      pageInfo {
        cursor
        hasNextPage
      }
    }
    ${Post.fragments.post}
  `,
};
