const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const Models = require('../models');
const logFilePath = path.join(__dirname, '../logs', `gapi.txt`);

const config = {
  channelsPerRequest: 5,
  maxChannels: 5,
  videosPerRequest: 5,
  maxVideos: 5,
  commentsPerRequest: 100,
  maxComments: 100,
  commentsOrder: 'time',
  timestampFormat: process.env.TIMESTAMP_FORMAT,
  logFileName: logFilePath,
  logs: fs.createWriteStream(logFilePath, { flags: 'a' })
};

function gapiRequest(api, params) {
  const query = `https://www.googleapis.com/${api}?${encodeParams(params)}&key=${process.env.YT_API_KEY}`;
  config.logs.write(`\n${moment().format(config.timestampFormat)}\t\t${query}`);

  return fetch(query, {
    method: 'get',
    headers: {
      'Accept': 'application/json'
    }
  }).then(res => {
    config.logs.write(`\nStatus Code: ${res.status}`);
    return res.json();
  }).then(data => {
    config.logs.write(`\nNextPageToken:\t${data.nextPageToken}\n\n`);
    return data;
  });
}

// async function gapiRequest(api, params) {
//   const query = `https://www.googleapis.com/${api}?${encodeParams(params)}&key=${process.env.YT_API_KEY}`;
//   config.logs.write(`\n${moment().format(config.timestampFormat)}\t\t${query}`);

//   let response;
//   try {
//     response = await fetch(query, {
//       method: 'get',
//       headers: {
//         'Accept': 'application/json'
//       }
//     });
//     config.logs.write(`\nStatus Code: ${response.status}`);
//     const data = await response.json();
//     config.logs.write(`\nNextPageToken:\t${data.nextPageToken}\n\n`);
//     return data;
//   }
//   catch (err) {
//     console.log(`Error for response`, response);
//     console.error(err);
//   }
//   finally {
//     return {};
//   }
// }

function encodeParams(params) {
  return Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join('&');
}

async function* channels(searchTerm) {
  const params = {
    part: 'snippet',
    q: searchTerm,
    maxResults: config.channelsPerRequest,
    type: 'channels'
  };

  let loadedChannels = 0;
  let response = await gapiRequest('youtube/v3/search', params);
  params.nextPageToken = response.nextPageToken;

  if (!response.items || response.items.length == 0)
    return;

  yield* response.items.map(Models.Channel);
  loadedChannels += (response.items || []).length;

  while (config.maxChannels < 0 || loadedChannels < config.maxChannels) {
    response = await gapiRequest('youtube/v3/search', params);
    params.nextPageToken = response.nextPageToken;

    if (!response.items || response.items.length == 0)
      return;

    yield* response.items.map(Models.Channel);
    loadedChannels += (response.items || []).length;
  }
}

async function* videos(searchTerm) {
  const params = {
    part: 'snippet',
    q: searchTerm,
    maxResults: config.videosPerRequest,
    type: 'videos'
  };

  let loadedVideos = 0;
  let response = await gapiRequest('youtube/v3/search', params);
  params.nextPageToken = response.nextPageToken;

  if (!response.items || response.items.length == 0)
    return;

  yield* response.items.map(Models.Video);
  loadedVideos += (response.items || []).length;

  while (config.maxVideos < 0 || loadedVideos < config.maxVideos) {
    response = await gapiRequest('youtube/v3/search', params);
    params.nextPageToken = response.nextPageToken;

    if (!response.items || response.items.length == 0)
      return;

    yield* response.items.map(item => Models.Video(item, searchTerm));
    loadedVideos += (response.items || []).length;
  }
}

async function* comments(videoId) {
  const params = {
    part: 'snippet',
    videoId: videoId,
    maxResults: config.commentsPerRequest,
    order: config.commentsOrder
  };

  let loadedComments = 0;
  let response = await gapiRequest('youtube/v3/commentThreads', params);
  params.nextPageToken = response.nextPageToken;

  if (!response.items || response.items.length == 0)
    return;

  yield* response.items.map(Models.Comment);
  loadedComments += (response.items || []).length;

  while (config.maxComments < 0 || loadedComments < config.maxComments) {
    response = await gapiRequest('youtube/v3/commentThreads', params);
    params.nextPageToken = response.nextPageToken;

    if (!response.items || response.items.length == 0)
      return;

    yield* response.items.map(Models.Comment);
    loadedComments += (response.items || []).length;
  }
}

// async function getVideosByChannel(channelId) {
//   const response = await gapiRequest('youtube/v3/search', {
//     part: 'snippet',
//     channelId: channelId,
//     maxResults: config.videosPerRequest,
//     type: 'videos'
//   });

//   runtime.nextPageVideos = response.nextPageToken;
//   return (response.items || []).map(createVideo);
// }

module.exports = {
  config,
  channels,
  videos,
  comments
};