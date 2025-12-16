const { MongoClient, ServerApiVersion } = require('mongodb');

const FALLBACK_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://pradeep1865_lib_owner:cooldude12@clusterlib1.scu8jvu.mongodb.net/?appName=ClusterLib1';
const DEFAULT_DB = process.env.MONGODB_DB || 'booklibrary';
const ALLOW_INSECURE_TLS = process.env.MONGODB_ALLOW_INVALID_CERTS === 'true';

let client;
let clientPromise;
let database;

function buildConnectionHint(error) {
  const messages = [
    'Verify your MongoDB connection string, username, and password.',
    'Ensure the cluster IP access list allows Vercel/host outbound traffic (try 0.0.0.0/0 for testing).',
    'Confirm TLS is enabled on the cluster when using mongodb+srv URLs.'
  ];

  if (ALLOW_INSECURE_TLS) {
    messages.unshift(
      'You enabled MONGODB_ALLOW_INVALID_CERTS=true. Use this only for troubleshooting self-signed or misconfigured certificates.'
    );
  }

  if (error?.message?.toLowerCase().includes('tls')) {
    messages.unshift(
      'TLS handshake failed. Double-check that your SRV string points to a TLS-enabled cluster or temporarily set MONGODB_ALLOW_INVALID_CERTS=true for debugging.'
    );
  }

  return messages.join(' ');
}

async function getClient() {
  if (!clientPromise) {
    const uri = process.env.MONGODB_URI || FALLBACK_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is not set. Provide a valid connection string in your environment.');
    }

    const clientOptions = {
      maxPoolSize: 5,
      tls: true,
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    };

    if (ALLOW_INSECURE_TLS) {
      clientOptions.tlsAllowInvalidCertificates = true;
      clientOptions.tlsAllowInvalidHostnames = true;
    }

    client = new MongoClient(uri, clientOptions);

    clientPromise = client.connect().catch((error) => {
      const hint = buildConnectionHint(error);
      const wrapped = new Error(`Failed to connect to MongoDB. ${hint}`);
      wrapped.cause = error;
      throw wrapped;
    });
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
