import DataLoader from 'dataloader';
import { filter as lodashFilter } from 'lodash';

const PAGINATION_DEFAULT_LIMIT = 20;
const PAGINATION_MAX_LIMIT = 50;

const LOADER_KEYS = {
  users: ['id', 'email'],
};

export default class SqlConnector {
  constructor({ knex }) {
    this.knex = knex;
    this.clearLoaders();
  }

  clearLoaders() {
    this.loaders = new Map();
  }

  getLoader(tableName, keyName) {
    const loaderName = `${tableName}:${keyName}`;
    let loader = this.loaders.get(loaderName);
    if (!loader) {
      loader = itemsByValueLoader(this.knex, tableName, keyName);
      this.loaders.set(loaderName, loader);
    }

    return loader;
  }

  async load(tableName, keyName, value) {
    const loader = this.getLoader(tableName, keyName);
    const item = await loader.load(value);
    if (item && item.id && keyName !== 'id') {
      const allLoaderKeys = LOADER_KEYS[tableName];
      if (allLoaderKeys) {
        for (const alternateKey of allLoaderKeys) {
          if (alternateKey !== keyName && item[alternateKey]) {
            const alternateLoader = this.getLoader(tableName, alternateKey);
            alternateLoader.prime(item[alternateKey], item);
          }
        }
      }
    }
    return item;
  }

  loadById(tableName, value) {
    return this.load(tableName, 'id', value);
  }

  async insert(tableName, data) {
    const result = await this.knex(tableName)
      .returning('*')
      .insert(data);

    // clear other loader in case the insert caused changes in other rows
    // e. g. a database trigger was run
    this.clearLoaders();

    const inserted = result[0];
    const loader = this.getLoader(tableName, 'id');
    loader.prime(inserted.id, inserted);

    // return object with id only, to force use `Repository.filter()` method
    return { id: inserted.id };
  }

  async update(tableName, id, data) {
    const result = await this.knex(tableName)
      .where({ id })
      .returning('*')
      .update(data);

    this.clearLoaders();
    const updated = result[0];
    const loader = this.getLoader(tableName, 'id');
    loader.prime(updated.id, updated);

    // return object with id only, to force use `Repository.filter()` method
    return { id: updated.id };
  }

  async deleteById(tableName, id) {
    const deletedCount = await this.knex(tableName)
      .where({ id })
      .delete();

    this.clearLoaders();
    return deletedCount > 0;
  }

  async deleteWhere(tableName, conditions) {
    const deletedCount = await this.knex(tableName)
      .where(conditions)
      .delete();

    this.clearLoaders();
    return deletedCount;
  }

  async mutate(callback) {
    const result = await callback(this.knex);
    this.clearLoaders();
    return result;
  }

  async mutateTx(callback) {
    const result = await this.knex.transaction(callback);
    this.clearLoaders();
    return result;
  }

  async loadAllWhere(tableName, conditions) {
    const conditionsKey = Object.keys(conditions)
      .sort()
      .join(':');
    const loaderName = `@where@${tableName}@${conditionsKey}`;
    let loader = this.loaders.get(loaderName);
    if (!loader) {
      loader = new DataLoader(
        async theConditions => {
          const baseQuery = this.knex(tableName);
          let query = baseQuery;
          for (const condition of theConditions) {
            query = query.orWhere(condition);
          }
          const rows = await query;
          return theConditions.map(condition => lodashFilter(rows, condition));
        },
        {
          cacheKeyFn: theConditions =>
            JSON.stringify(
              Object.keys(theConditions)
                .sort()
                .reduce((result, key) => {
                  result[key] = theConditions[key];
                  return result;
                }, {})
            ),
        }
      );
      this.loaders.set(loaderName, loader);
    }
    return loader.load(conditions);
  }

  async checkIfNotExists(tableName, fieldName, value) {
    const baseQuery = this.knex(tableName).where(fieldName, value);
    const existsQuery = this.knex
      .raw(baseQuery)
      .wrap('SELECT EXISTS (', ') as exists');
    const queryResult = await existsQuery;
    return !queryResult.rows[0].exists;
  }

  async loadConnection(table, { before, after, first, last, filter }) {
    if (first && last) {
      throw new Error('Combining `first` and `last` is not supported');
    }

    if (before && first) {
      throw new Error('`first` cannot be used with `before`');
    }

    if (after && last) {
      throw new Error('`after` cannot be used with `last`');
    }

    const { knex } = this;

    const descending = !!last;
    const order = descending ? 'desc' : null;
    let limit = last || first;
    if (!limit) {
      limit = PAGINATION_DEFAULT_LIMIT;
    }
    limit = Math.min(limit, PAGINATION_MAX_LIMIT);

    let query = knex(table).limit(limit + 1);

    if (after) {
      query = query.where('id', '>', after);
    }
    if (before) {
      query = query.where('id', '<', before);
    }
    if (filter) {
      query = query.where(filter);
    }

    query = query.orderBy('id', order);

    let nodes = await query;

    const hasNextPage = nodes.length > limit;

    if (nodes.length > limit) {
      nodes = nodes.slice(0, limit);
    }

    const lastItem = nodes[nodes.length - 1];
    const cursor = lastItem ? lastItem.id : null;

    if (nodes.length) {
      const loader = this.getLoader(table, 'id');
      nodes.forEach(node => {
        loader.prime(node.id, node);
      });
    }

    const ids = nodes.map(node => node.id);

    return {
      ids,
      pageInfo: {
        cursor,
        hasNextPage,
      },
    };
  }
}

function itemsByValueLoader(knex, table, fieldName) {
  return new DataLoader(async fieldValues => {
    const items = await knex(table).whereIn(fieldName, fieldValues);
    const itemsByFieldValue = new Map();
    items.forEach(item => {
      itemsByFieldValue.set(item[fieldName], item);
    });
    return fieldValues.map(value => itemsByFieldValue.get(value));
  });
}
