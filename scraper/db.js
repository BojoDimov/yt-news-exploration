require('dotenv').config();
const fs = require('fs');
const path = require('path');
const OrientDB = require('orientjs');

const client = OrientDB({
  host: process.env.ORIENTDB_HOST,
  port: process.env.ORIENTDB_PORT,
  username: process.env.ORIENTDB_USERNAME,
  password: process.env.ORIENTDB_PASSWORD
});

const db = client.use({
  name: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD
});

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../reviews.json')).toString('utf-8'));

async function insertVideo(video) {
  const transaction = db.let('video', v => {
    v.create('vertex', 'YoutubeVideo')
      .set({
        videoId: video.videoId,
        title: video.title,
        tag: "review",
        description: video.description,
        publishedAt: video.publishedAt,
        thumbnail: video.thumbnail
      });
  });
  for (let j = 0; j < video.comments.length; ++j) {
    transaction.let(`comment${j}`, v => {
      v.create('vertex', 'YoutubeComment')
        .set(video.comments[j]);
    });
    transaction.let(`hasComment${j}`, e => {
      e.create('edge', 'HasComment')
        .from(`$video`)
        .to(`$comment${j}`);
    });
  }
  await transaction.commit().return('$video').all();
  console.log(`Inserted video`, video);
}

(async function () {
  for (let i = 0; i < data.length; i++)
    await insertVideo(data[i]);
})()