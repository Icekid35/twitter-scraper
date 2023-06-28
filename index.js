import { TwitterApi } from 'twitter-api-v2'
import {config} from 'dotenv'
config()
// require('dotenv').config();
const test_user="@bod_republic"

const client = new TwitterApi({
    appKey: process.env.TWITTER_KEY,
    appSecret: process.env.TWITTER_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,});

    const user=await client.v2.me()
    console.log(user)


// curl --request POST --url https://api.twitter.com/oauth/request_token --header 'Authorization: OAuth oauth_consumer_key="CrjZbOLjj0d8ZYqSugpt58w7p", oauth_consumer_secret="oKERhnb4D6p0LpjW0L9Jb3JC5S7d26jUZ9w4swpJLd7xnNKr4M"'
