const PAGINATION_DEFAULT_LIMIT = 20;
const PAGINATION_MAX_LIMIT = 50;

export default class ElasticsearchConnector {
  constructor({ client }) {
    this.client = client;
  }

  index(indexAndType, esId, body) {
    return this.client.index({
      index: indexAndType,
      type: indexAndType,
      id: esId,
      body,
    });
  }

  delete(indexAndType, esId) {
    return this.client.delete({
      index: indexAndType,
      type: indexAndType,
      id: esId,
    });
  }

  async search({ index, type, orderBy, phrase, before, first }) {
    // esclient.search({
    //   index: 'posts',
    //   type: 'posts',
    //   body: {
    //     query: { match: { body: 'dolores' } },
    //     sort: [{ _id: 'desc' }],
    //     size: 3,
    //     search_after: ['85'],
    //   },
    // });
    let limit = first || PAGINATION_DEFAULT_LIMIT;
    limit = Math.min(limit, PAGINATION_MAX_LIMIT);

    const queryBody = {
      query: { match: { body: phrase } },
      sort: [{ [orderBy]: 'desc' }],
      size: limit + 1,
    };
    if (before) {
      queryBody.search_after = [before];
    }

    const response = await this.client.search({
      index,
      type,
      body: queryBody,
    });

    let hits = response.hits.hits;
    const hasNextPage = hits.length > limit;
    if (hasNextPage) {
      hits = hits.slice(0, limit);
    }
    const ids = hits.map(hit => hit._id);
    const cursor = ids[ids.length - 1];
    return {
      ids,
      pageInfo: {
        cursor,
        hasNextPage,
      },
    };
  }
}
