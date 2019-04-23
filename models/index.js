const moment = require('moment');
const timestampFormat = process.env.TIMESTAMP_FORMAT;

function Channel(item) {
  return {
    channelId: item.id.channelId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.default.url
  };
}

function Video(item) {
  return {
    videoId: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    tag: "",
    publishedAt: moment(item.snippet.publishedAt).format(timestampFormat),
    thumbnail: item.snippet.thumbnails.default.url
  };
}

function Comment(item) {
  const comment = item.snippet.topLevelComment;
  return {
    commentId: comment.id,
    authorDisplayName: comment.snippet.authorDisplayName,
    authorProfileImageUrl: comment.snippet.authorProfileImageUrl,
    textDisplay: comment.snippet.textDisplay,
    textOriginal: comment.snippet.textOriginal,
    viewerRating: comment.snippet.viewerRating,
    likeCount: comment.snippet.likeCount,
    publishedAt: moment(comment.snippet.publishedAt).format(timestampFormat),
  };
}

module.exports = {
  Channel, Video, Comment
};