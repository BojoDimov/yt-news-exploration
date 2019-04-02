const commentDefinition = {
  "kind": "youtube#comment",
  "etag": "etag",
  "id": "string",
  "snippet": {
    "authorDisplayName": "string",
    "authorProfileImageUrl": "string",
    "authorChannelUrl": "string",
    //this should be edge to channels
    "authorChannelId": {
      "value": "string"
    },
    //this should be edge to channels
    "channelId": "string",
    //this should be edge to videos
    "videoId": "string",
    "textDisplay": "string",
    "textOriginal": "string",
    //this should be edge to comments
    "parentId": "string",
    "canRate": "boolean",
    "viewerRating": "string",
    "likeCount": "unsigned integer",
    "moderationStatus": "string",
    "publishedAt": "datetime",
    "updatedAt": "datetime"
  }
}