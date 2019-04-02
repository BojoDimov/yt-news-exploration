require('dotenv').config();
const OrientDB = require('orientjs');

const server = OrientDB({
  host: process.env.ORIENTDB_HOST,
  port: process.env.ORIENTDB_PORT,
  username: process.env.ORIENTDB_USERNAME,
  password: process.env.ORIENTDB_PASSWORD
});

const db = server.use({
  name: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD
});

db.close();
server.close();