(async function () {
  require('dotenv').config();
  const OrientDB = require('orientjs');

  const server = OrientDB({
    host: process.env.ORIENTDB_HOST,
    port: process.env.ORIENTDB_PORT,
    username: process.env.ORIENTDB_USERNAME,
    password: process.env.ORIENTDB_PASSWORD
  });

  // const dbs = await server.list();
  // console.log(dbs);
  await init(server);
})();

async function init(server) {
  let db, channel, video, comment;

  try {
    db = await initDatabase(server);
    channel = await initChannelClass(db);
    video = await initVideoClass(db);
    comment = await initCommentClass(db);
    console.log('Successfully created all database objects.')
  }
  catch (err) {
    console.log('There was error creating objects', err)
  }
  finally {
    db.close();
    server.close();
  }
}

async function initDatabase(server) {
  let db;

  try {
    db = server.use(process.env.DB_NAME);
    console.log(`Database ${process.env.DB_NAME} exists, skipping...`);
  }
  catch (err) {
    // db = await server.create({
    //   name: process.env.DB_NAME,
    //   type: 'graph',
    //   storage: 'plocal',
    //   username: process.env.DB_USERNAME,
    //   password: process.env.DB_PASSWORD
    // });
    console.log('Could not find specified database');
    throw null;
  }

  return db;
}

async function initChannelClass(db) {
  let channelClass;
  try {
    channelClass = await db.class.get('YoutubeChannel');
    console.log('YoutubeChannel class exists, skipping...');
  }
  catch (err) {
    channelClass = await db.class.create('YoutubeChannel', 'V');
    console.log('YoutubeChannel class created successfully.');

    await channelClass.property.create([
      { name: 'channelId', type: 'String' },
      { name: 'title', type: 'String' },
      { name: 'description', type: 'String' },
      { name: 'thumbnail', type: 'String' }
    ]);
    console.log('YoutubeChannel properties created successfully.');
  }

  return channelClass;
}

async function initVideoClass(db) {
  let videoClass;

  try {
    videoClass = await db.class.get('YoutubeVideo');
    console.log('YoutubeVideo class exists, skipping...');
  }
  catch (err) {
    videoClass = await db.class.create('YotubeVideo', 'V');
    console.log('YoutubeVideo class created successfully.');

    await videoClass.property.create([
      { name: 'videoId', type: 'String' },
      { name: 'title', type: 'String' },
      { name: 'description', type: 'String' },
      { name: 'thumbnail', type: 'String' },
      { name: 'tag', type: 'String' },
      { name: 'publishedAt', type: 'DateTime' }
    ]);
    console.log('YoutubeVideo properties created successfully.');
  }

  return videoClass;
}

async function initCommentClass(db) {
  let commentClass;

  try {
    commentClass = await db.class.get('YoutubeComment');
    console.log('YoutubeComment class exists, skipping...');
  }
  catch (err) {
    commentClass = await db.class.create('YoutubeComment', 'V');
    console.log('YoutubeComment class created successfully.');

    await commentClass.property.create([
      { name: 'commentId', type: 'String' },
      { name: 'authorDisplayName', type: 'String' },
      { name: 'authorProfileImageUrl', type: 'String' },
      { name: 'textDisplay', type: 'String' },
      { name: 'textOriginal', type: 'String' },
      { name: 'viewerRating', type: 'String' },
      { name: 'likeCount', type: 'Integer' },
      { name: 'publishedAt', type: 'DateTime' },
      { name: 'updatedAt', type: 'DateTime' }
    ]);
    console.log('YoutubeComment properties created successfully.');
  }

  return commentClass;
}