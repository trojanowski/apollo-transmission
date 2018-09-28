import { Mutation } from 'react-apollo';
import React from 'react';
import gql from 'graphql-tag';

import NewPostForm from '../components/NewPostForm';
import Post from '../components/Post';
import { newPostUpdater } from '../utils/updaters';

class NewPostPage extends React.Component {
  handleSuccess = response => {
    this.props.history.push(`/posts/${response.data.createPost.id}`);
  };

  render() {
    return (
      <NewPostForm
        initialValues={{ body: '' }}
        onSuccess={this.handleSuccess}
        savePost={this.props.createPost}
      />
    );
  }
}

export default class NewPostPageWithMutation extends React.Component {
  render() {
    return (
      <Mutation
        mutation={gql`
          mutation CreatePostMutation($input: CreatePostInput!) {
            createPost(input: $input) {
              ...PostComponentFragment
            }
          }
          ${Post.fragments.post}
        `}
        update={newPostUpdater}
      >
        {createPostMutation => (
          <NewPostPage
            {...this.props}
            createPost={input => createPostMutation({ variables: { input } })}
          />
        )}
      </Mutation>
    );
  }
}
