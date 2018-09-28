import knexLib from 'knex';

import knexFile from '../knexfile';

import createEsClient from '../utils/createEsClient';

const POSTS_TABLE = 'posts';
const POSTS_INDEX = POSTS_TABLE;

const POSTS_ES_SCHEMA = {
  // custom id field is required for sorting by numeric values
  postId: { type: 'long', index: false },
  body: { type: 'text' },
};

(async () => {
  const esClient = createEsClient();
  // recreate elasticsearch index
  if (await esClient.indices.exists({ index: POSTS_INDEX })) {
    await esClient.indices.delete({ index: POSTS_INDEX });
  }
  await esClient.indices.create({ index: POSTS_INDEX });
  await esClient.indices.putMapping({
    index: POSTS_INDEX,
    type: POSTS_INDEX,
    body: { properties: POSTS_ES_SCHEMA },
  });

  const knex = knexLib(knexFile.development);

  const bulkOperations = [];
  const posts = await knex(POSTS_TABLE).select('*');
  for (const post of posts) {
    bulkOperations.push(
      { index: { _index: POSTS_INDEX, _type: POSTS_INDEX, _id: post.id } },
      { postId: post.id, body: post.body }
    );
  }
  await esClient.bulk({ body: bulkOperations });
  process.exit(0);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
