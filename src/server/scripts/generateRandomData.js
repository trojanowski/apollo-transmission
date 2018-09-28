import casual from 'casual';
import knexLib from 'knex';

import knexFile from '../knexfile';

const knex = knexLib(knexFile.development);

const USERS_TO_GENERATE = 10;
const POSTS_TO_GENERATE = 100;
const POST_LENGTH_LIMIT = 280;

(async () => {
  const userIds = [];
  for (let userIndex = 0; userIndex < USERS_TO_GENERATE; userIndex++) {
    const userData = {
      username: casual.username,
      email: casual.email,
      created_at: new Date(),
    };
    const [userId] = await knex('users')
      .insert(userData)
      .returning('id');
    console.log(`Saved user with id ${userId}`);
    userIds.push(userId);
  }

  for (let postIndex = 0; postIndex < POSTS_TO_GENERATE; postIndex++) {
    let body = '';
    const partsToGenerate = casual.integer(1, 5);
    for (let partIndex = 0; partIndex < partsToGenerate; partIndex++) {
      const part = casual.text;
      if (body.length + part.length > POST_LENGTH_LIMIT) {
        break;
      }
      body += part;
    }
    const authorId = casual.random_element(userIds);
    const now = new Date();
    const postData = {
      author_id: authorId,
      body,
      created_at: now,
    };
    const [postId] = await knex('posts')
      .insert(postData)
      .returning('id');
    console.log(`Saved post with id ${postId}`);
  }

  process.exit(0);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
