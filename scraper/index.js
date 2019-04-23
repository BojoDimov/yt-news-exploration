require('dotenv').config();
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const OrientDB = require('orientjs');
const Scraper = require('./scrapers');

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

async function scrapeVideos(searchTerm) {
  Scraper.config.videosPerRequest = 50;
  Scraper.config.maxVideos = 100;
  Scraper.config.commentsPerRequest = 50;
  Scraper.config.maxComments = 50;

  for await (let video of Scraper.videos(searchTerm)) {
    video.tag = searchTerm;
    video.comments = [];

    Scraper.config.commentsOrder = 'time';
    for await (let comment of Scraper.comments(video.videoId))
      video.comments.push(comment);

    Scraper.config.commentsOrder = 'relevance';
    for await (let comment of Scraper.comments(video.videoId))
      video.comments.push(comment);

    const transaction = db.let('video', v => {
      v.create('vertex', 'YoutubeVideo')
        .set({
          videoId: video.videoId,
          title: video.title,
          tag: video.tag,
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

    try {
      await transaction.commit().return('$video').all();
      console.log(`Saved video ${video.videoId}, with ${video.comments.length} comments to database`);
    }
    catch (err) {
      console.log(`Error saving video ${video.videoId}`);
      console.log(video);
      console.log(err);
    }
  }
}

(async function () {
  try {
    res = await scrapeVideos('Donald Trump');
    console.log(`Finished scraping videos`);
  }
  catch (err) {
    console.error(err);
  }
  finally {
    process.exit();
  }
})();

// scrapeVideosPipeline('review')
//   .then(data => {
//     return fs.writeFileSync(path.join(__dirname, '../reviews.json'), JSON.stringify(data), 'utf-8')
//   })
//   .then(() => console.log('Successfully scraped review videos comments'))
//   .catch(err => console.log('There was an error', err));