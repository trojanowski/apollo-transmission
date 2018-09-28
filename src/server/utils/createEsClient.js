import elasticsearch from 'elasticsearch';

const HOST = process.env.ES_HOST || 'localhost';
const PORT = 9200;

export default function createEsClient() {
  return new elasticsearch.Client({ host: { host: HOST, port: PORT } });
}
