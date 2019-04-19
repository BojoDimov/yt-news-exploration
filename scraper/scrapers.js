const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const Models = require('../models');
const logFilePath = path.join(__dirname, '../logs', `gapi.txt`);

const config = {
  channelsPerRequest: 5,
  videosPerRequest: 5,
  commentsPerRequest: 100,
  timestampFormat: process.env.TIMESTAMP_FORMAT,
  logFileName: logFilePath,
  logs: fs.createWriteStream(logFilePath, { flags: 'a' }),
  restrict: false
};

function gapiRequest(api, params) {
  const query = `https://www.googleapis.com/${api}?${encodeParams(params)}&key=${process.env.YT_API_KEY}`;
  config.logs.write(`${moment().format(config.timestampFormat)}\t\t${query}`);

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

async function* channels(searchTerm) {
  const params = {
    part: 'snippet',
    q: searchTerm,
    maxResults: config.channelsPerRequest,
    type: 'channels'
  };

  let response = await gapiRequest('youtube/v3/search', params);
  params.nextPageToken = response.nextPageToken;

  if (!response.items || response.items.length == 0)
    return;

  yield* response.items.map(Models.Channel);

  while (!config.restrict) {
    response = await gapiRequest('youtube/v3/search', params);
    params.nextPageToken = response.nextPageToken;

    if (!response.items || response.items.length == 0)
      return;

    yield* response.items.map(Models.Channel);
  }
}

async function* videos(searchTerm) {
  const params = {
    part: 'snippet',
    q: searchTerm,
    maxResults: config.videosPerRequest,
    type: 'videos'
  };

  let response = await gapiRequest('youtube/v3/search', params);
  params.nextPageToken = response.nextPageToken;

  if (!response.items || response.items.length == 0)
    return;

  yield* response.items.map(item => Models.Video(item, searchTerm));

  while (!config.restrict) {
    response = await gapiRequest('youtube/v3/search', params);
    params.nextPageToken = response.nextPageToken;

    if (!response.items || response.items.length == 0)
      return;

    yield* response.items.map(item => Models.Video(item, searchTerm));
  }
}

async function* comments(videoId) {
  const params = {
    part: 'snippet',
    videoId: videoId,
    maxResults: config.commentsPerRequest
  };

  let response = await gapiRequest('youtube/v3/commentThreads', params);
  params.nextPageToken = response.nextPageToken;

  if (!response.items || response.items.length == 0)
    return;

  yield* response.items.map(Models.Comment);

  while (!config.restrict) {
    response = await gapiRequest('youtube/v3/commentThreads', params);
    params.nextPageToken = response.nextPageToken;

    if (!response.items || response.items.length == 0)
      return;

    yield* response.items.map(Models.Comment);
  }
}

async function getVideosByChannel(channelId) {
  const response = await gapiRequest('youtube/v3/search', {
    part: 'snippet',
    channelId: channelId,
    maxResults: config.videosPerRequest,
    type: 'videos'
  });

  runtime.nextPageVideos = response.nextPageToken;
  return (response.items || []).map(createVideo);
}

module.exports = {
  getVideosByChannel,
  config,
  channels,
  videos,
  comments
};