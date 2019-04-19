require('dotenv').config();
const moment = require('moment');
const fs = require('fs');
const path = require('path');

const Scraper = require('./scrapers');

async function scrapeChannelsPipeline(searchTerm) {
  const channels = await Scraper.getChannels(searchTerm);
  for (let i = 0; i < channels.length; i++) {
    const videos = await Scraper.getVideosByChannel(channels[i].channelId);
    for (let j = 0; j < videos.length; j++)
      videos[j].comments = await Scraper.getComments(videos[j].videoId);
    channels[i].videos = videos;
  }
  return channels;
}

async function scrapeVideosPipeline(searchTerm) {
  Scraper.config.videosPerRequest = 5;
  Scraper.config.commentsPerRequest = 50;
  const videos = await Scraper.getVideosBySearch(searchTerm);
  for (let i = 0; i < videos.length; ++i)
    videos[i].comments = await Scraper.getComments(videos[i].videoId);
  return videos;
}

async function scrapeVideosGenerator(searchTerm) {
  Scraper.config.videosPerRequest = 25;
  for await (let video of Scraper.videos(searchTerm))
    console.log('Scraped video ', video);
}

// scrapeChannelsPipeline('news')
//   .then(data => {
//     return fs.writeFileSync(path.join(__dirname, '../scraped-data.json'), JSON.stringify(data), 'utf-8');
//   })
//   .then(() => console.log('Successfully scraped 5x5x5 channels videos comments'))
//   .catch(err => console.log('There was an error', err));

// scrapeVideosPipeline('review')
//   .then(data => {
//     return fs.writeFileSync(path.join(__dirname, '../reviews.json'), JSON.stringify(data), 'utf-8')
//   })
//   .then(() => console.log('Successfully scraped review videos comments'))
//   .catch(err => console.log('There was an error', err));
(async function () {
  scrapeVideosGenerator('review');
})()