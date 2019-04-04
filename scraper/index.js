require('dotenv').config();
const fetch = require('node-fetch');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

async function scrapeChannels(searchTerm) {
  const response = await gapiRequest('youtube/v3/search', {
    part: 'snippet',
    maxResults: 5,
    q: searchTerm,
    type: 'channel'
  });

  return (response.items || []).map(item => {
    return {
      channelId: item.id.channelId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.default.url
    };
  });
}

async function scrapeVideos(channelId) {
  const response = await gapiRequest('youtube/v3/search', {
    part: 'snippet',
    channelId: channelId,
    maxResults: 5,
    type: 'videos'
  });

  return (response.items || []).map(item => {
    return {
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt, //moment(item.snippet.publishedAt),
      thumbnail: item.snippet.thumbnails.default.url
    };
  });
}

async function scrapeComments(videoId) {
  const response = await gapiRequest('youtube/v3/commentThreads', {
    part: 'snippet',
    videoId: videoId,
    maxResults: 5
  });

  return (response.items || []).map(item => {
    const comment = item.snippet.topLevelComment;
    return {
      commentId: comment.id,
      authorDisplayName: comment.snippet.authorDisplayName,
      authorProfileImageUrl: comment.snippet.authorProfileImageUrl,
      textDisplay: comment.snippet.textDisplay,
      textOriginal: comment.snippet.textOriginal,
      viewerRating: comment.snippet.viewerRating,
      likeCount: comment.snippet.likeCount,
      publishedAt: comment.snippet.publishedAt
    };
  });
}

async function scrape(searchTerm) {
  const channels = await scrapeChannels(searchTerm);
  for (let i = 0; i < channels.length; i++) {
    const videos = await scrapeVideos(channels[i].channelId);
    for (let j = 0; j < videos.length; j++)
      videos[j].comments = await scrapeComments(videos[j].videoId);
    channels[i].videos = videos;
  }
  return channels;
}

scrape('news')
  .then(data => {
    return fs.writeFileSync(path.join(__dirname, '../scraped-data.json'), JSON.stringify(data), 'utf-8');
  })
  .then(() => console.log('Successfully scraped 5x5x5 channels videos comments'))
  .catch(err => console.log('There was an error', err));


function gapiRequest(api, params) {
  const query = `https://www.googleapis.com/${api}?${encodeParams(params)}&key=${process.env.YT_API_KEY}`;
  return fetch(query, {
    method: 'get',
    headers: {
      'Accept': 'application/json'
    }
  }).then(res => res.json());
}

function encodeParams(params) {
  return Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join('&');
}