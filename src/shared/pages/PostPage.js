import { Query } from 'react-apollo';
import React from 'react';
import gql from 'graphql-tag';

import NotFound from '../components/NotFound';
import Post from '../components/Post';

class PostPage extends React.Component {
  redirectToMain = () => {
    this.props.history.replace('/');
  };

  render() {
    const { loading, post } = this.props;
    if (loading) {
      return null;
    }
    if (!post) {
      return <NotFound />;
    }
    return (
      <div>
        <Post afterDelete={this.redirectToMain} post={post} />
      </div>
    );
  }
}

export default class PostPageWithData extends React.Component {
  render() {
    return (
      <Query
        query={gql`
          query PostQuery($postId: String!) {
            post(id: $postId) {
              ...PostComponentFragment
            }
          }
          ${Post.fragments.post}
        `}
        variables={{ postId: this.props.match.params.postId }}
      >
        {({ data: { loading, post } }) => (
          <PostPage {...this.props} loading={loading} post={post} />
        )}
      </Query>
    );
  }
}
