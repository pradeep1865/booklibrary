const { MongoClient } = require('mongodb');

const DEFAULT_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://pradeep1865_lib_owner:cooldude12@clusterlib1.scu8jvu.mongodb.net/?appName=ClusterLib1';
const DEFAULT_DB = process.env.MONGODB_DB || 'booklibrary';

let client;
let clientPromise;
let database;

async function getClient() {
  if (!clientPromise) {
    client = new MongoClient(DEFAULT_URI, { maxPoolSize: 5 });
    clientPromise = client.connect();
  }
  await clientPromise;
  return client;
}

async function getDb() {
  if (database) return database;
  const connectedClient = await getClient();
  database = connectedClient.db(DEFAULT_DB);
  return database;
}

module.exports = { getDb };
