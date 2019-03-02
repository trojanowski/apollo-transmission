import camelcaseKeys from 'camelcase-keys';
import decamelize from 'decamelize';
import { isObjectLike } from 'lodash';
import knexLib from 'knex';

import knexFile from '../knexfile';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function camelcaseRow(row) {
  if (isObjectLike(row)) {
    return camelcaseKeys(row);
  }
  return row;
}

export default function createKnex() {
  return knexLib({
    ...knexFile[process.env.NODE_ENV || 'development'],
    asyncStackTraces: !IS_PRODUCTION,
    postProcessResponse(result) {
      if (Array.isArray(result)) {
        return result.map(row => {
          return camelcaseRow(row);
        });
      }
      return camelcaseRow(result);
    },
    wrapIdentifier(value, origImpl) {
      return origImpl(decamelize(value));
    },
  });
}
