(async function () {
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

  try {
    const videoChannelEdge = await db.class.create('VideoPostedOn', 'E');
    console.log(videoChannelEdge);
    await db.class.update({
      from: 'YoutubeVideo',
      to: 'YoutubeChannel'
    });
  }
  catch (err) {
    console.log(err);
  }
})();