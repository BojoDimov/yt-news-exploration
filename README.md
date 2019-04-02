# yt-news-exploration
The main purpose of this project is to develop a scalable architecture for extracting information from YouTube and building some machine learning models over the data. The things I will be extracting are news videos. The concept is as follows:
1. Query YouTube API for news channels.
2. For every channel, scrape videos information based on some criteria (chronologically, either ascending or descending).
3. For every video, scrape commentThreads information (root-level comments).

### Some ideas for ML models over that kind of data:
1. By doing semantic analysis over the comments, answer whether the poarticular news is positive or negative.
2. Compare same news representation over different channels.
3. Search for general attitude of speciffic user based on all of their comments.

## Architecture
1. Docker container with OrientDb for the graph store.
2. Docker container with NodeJS for the scraping.
3. Docker container with Python for the classification of data.
4. Docker container with JupyterNotebook for data exploration.

### Technologies
1. NodeJS
2. Db - OrientDb (mostly using the graph store)
3. OrientJS - OrientDB driver for NodeJS

### Queries
Retrieve list of news channels
```
GET https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=news&type=channel&key={YOUR_API_KEY}
```