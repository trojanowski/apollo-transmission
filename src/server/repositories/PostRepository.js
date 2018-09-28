import { ForbiddenError } from '../errors';
import UserRepository from './UserRepository';
import loadConnection from '../utils/loadConnection';
import postSchema from '../../shared/validation/postSchema';
import validateWithSchema from '../utils/validateWithSchema';

class Post {
  constructor(data) {
    Object.assign(this, data);
  }
}

const PostRepository = {
  async getById(context, id) {
    const postData = await context.sql.loadById('posts', id);
    if (!postData) {
      return null;
    }

    return new Post(postData);
  },

  async allPosts(context, args) {
    const connectionData = await context.sql.loadConnection('posts', args);
    return loadConnection(context, PostRepository.getById, connectionData);
  },

  async timeline(context, args) {
    const { currentUser } = context;
    if (!currentUser.isAuthenticated) {
      return null;
    }

    const connectionData = await context.sql.loadConnection('posts', {
      ...args,
      filter: builder =>
        builder
          .where({ authorId: currentUser.id })
          .orWhereIn(
            'authorId',
            UserRepository.getFollowedQuery(context, currentUser.id)
          ),
    });
    return loadConnection(context, PostRepository.getById, connectionData);
  },

  async findByAuthorId(context, authorId, args) {
    const connectionData = await context.sql.loadConnection('posts', {
      ...args,
      filter: {
        authorId,
      },
    });
    return loadConnection(context, PostRepository.getById, connectionData);
  },

  async search(context, { phrase, before, first }) {
    const connectionData = await context.esConnector.search({
      index: 'posts',
      type: 'posts',
      orderBy: 'postId',
      phrase,
      before,
      first,
    });
    return loadConnection(context, PostRepository.getById, connectionData);
  },

  async create(context, data) {
    const { currentUser } = context;
    currentUser.requireAuthenticated();

    const validatedData = await validateWithSchema(postSchema, data);
    const newPostData = {
      ...validatedData,
      authorId: currentUser.id,
    };

    const { id } = await context.sql.insert('posts', newPostData);
    // a better idea would be to have a separate worker process which
    // listens to `new post` events and does the indexing
    await context.esConnector.index('posts', id, {
      postId: id,
      body: newPostData.body,
    });
    return PostRepository.getById(context, id);
  },

  async delete(context, id) {
    const post = await PostRepository.getById(context, id);
    if (!PostRepository.canDelete(context, post)) {
      throw new ForbiddenError("You don't have rights to delete this post");
    }
    await context.sql.deleteById('posts', id);
    await context.esConnector.delete('posts', id);

    return {
      deletedId: id,
    };
  },

  // The same rules for deleting as for editing
  canDelete(context, post) {
    if (!post) {
      return false;
    }

    const { currentUser } = context;
    return post.authorId === currentUser.id;
  },
};

export default PostRepository;
