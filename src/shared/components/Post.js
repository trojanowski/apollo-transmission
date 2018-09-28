import Composer from 'react-composer';
import { Link } from 'react-router-dom';
import { Mutation } from 'react-apollo';
import React from 'react';
import TimeAgo from 'react-timeago';
import gql from 'graphql-tag';

import { CurrentUserConsumer } from './CurrentUserContext';
import FollowingButton from './FollowingButton';
import { deletePostUpdater } from '../utils/updaters';
import isCurrentUser from '../utils/isCurrentUser';

class Post extends React.Component {
  handleDelete = () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    this.props.deletePost();
    this.props.afterDelete && this.props.afterDelete();
  };

  render() {
    const { followAuthor, post, unfollowAuthor } = this.props;
    const { author } = post;
    return (
      <article>
        <div>
          <div className="media mt-3 mb-3">
            <img className="d-flex mr-3" src={author.avatarUrl48} alt="" />
            <div className="media-body">
              <div>
                By <Link to={`/@${author.username}`}>{author.username}</Link>
              </div>
              <div>
                <small>
                  <Link to={`/posts/${post.id}`}>
                    <TimeAgo date={post.createdAt} suppressHydrationWarning />
                  </Link>
                </small>
              </div>
              <div>
                {author.following ? (
                  <FollowingButton onClick={unfollowAuthor} />
                ) : (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={followAuthor}
                  >
                    Follow
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <CurrentUserConsumer>
          {({ currentUser }) =>
            isCurrentUser(currentUser, post.author) && (
              <div className="mb-3">
                <button
                  className="btn btn-outline-danger"
                  onClick={this.handleDelete}
                >
                  Delete
                </button>
              </div>
            )
          }
        </CurrentUserConsumer>
        <p>{post.body}</p>
        <hr />
      </article>
    );
  }
}

Post.fragments = {
  post: gql`
    fragment PostComponentFragment on Post {
      id
      body
      createdAt
      author {
        id
        username
        avatarUrl48: avatarUrl(size: 48)
        following
      }
    }
  `,
};

class PostWithMutations extends React.Component {
  render() {
    const { post, ...restProps } = this.props;
    return (
      <Composer
        components={[
          ({ render }) => (
            <Mutation
              children={render}
              mutation={gql`
                mutation DeletePost($id: String!) {
                  deletePost(id: $id) {
                    deletedId
                  }
                }
              `}
              variables={{ id: post.id }}
              update={(store, result) => {
                deletePostUpdater(store, result, { post });
              }}
            />
          ),
          ({ render }) => (
            <Mutation
              children={render}
              mutation={gql`
                mutation FollowUser($id: String!) {
                  followUser(id: $id) {
                    id
                    following
                  }
                }
              `}
              variables={{ id: post.author.id }}
            />
          ),
          ({ render }) => (
            <Mutation
              children={render}
              mutation={gql`
                mutation UnfollowUser($id: String!) {
                  unfollowUser(id: $id) {
                    id
                    following
                  }
                }
              `}
              variables={{ id: post.author.id }}
            />
          ),
        ]}
      >
        {([deletePost, followAuthor, unfollowAuthor]) => {
          return (
            <Post
              {...restProps}
              deletePost={deletePost}
              followAuthor={followAuthor}
              post={post}
              unfollowAuthor={unfollowAuthor}
            />
          );
        }}
      </Composer>
    );
  }
}

PostWithMutations.fragments = Post.fragments;

export default PostWithMutations;
