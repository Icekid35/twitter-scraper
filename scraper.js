import * as fs from 'node:fs/promises';
import puppeteer from 'puppeteer';
// import puppeteer from 'puppeteer-core';

const profileUrl ='https://twitter.com/bod_republic'
const tweetCount = 5000;

console.log("starting...")
  const browser = await puppeteer.launch({
    // executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe" 
  });
console.log("loaded puppeteer...")

  const page = await browser.newPage();
console.log("loaded new page....")
      await page.setDefaultNavigationTimeout(0);

  // Navigate to the Twitter page
  await page.goto(profileUrl, { waitUntil: 'networkidle2' });
console.log("navigated to selected url")
  
  // Wait for the page to load
//   await page.waitForSelector('article[data-testid="tweet"]');
    // Scroll to load more tweets
    let previousHeight;
    let now = 0;
    let currentTweetCount = await page.$$eval('.tweet', tweets => tweets.length);
    
    while (tweetCount > currentTweetCount) {
      previousHeight = await page.evaluate('document.documentElement.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)');
      await page.waitForFunction(`document.documentElement.scrollHeight > ${previousHeight}`);
      
      await page.waitForTimeout(3000); // Adjust the delay as needed
      
      // Wait for new tweets to load
      await page.waitForFunction((previousCount) => {
        const newTweetCount = document.querySelectorAll('article[data-testid="tweet"]').length;
        return newTweetCount > previousCount + 5;
      }, {}, currentTweetCount);
      
      currentTweetCount = await page.$$eval('article[data-testid="tweet"]', tweets => tweets.length);
      now++;
      
      console.log(`Loaded ${now} page now...with ${currentTweetCount} tweets....`);
    }
    
  console.log(`loaded ${tweetCount} tweets completed now...`)
  // Extract the tweets
  const tweets = await page.evaluate(() => {
    const extractedTweets = [];
    console.log("extracting now...")
    const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');
    
    tweetElements.forEach((element) => {
      const tweet = {};
      
      // Extract tweet text
      const tweetTextElement = element.querySelector('article[data-testid="tweet"] div[data-testid="tweetText"] span');
      tweet.text = tweetTextElement ? tweetTextElement.innerText : '';
      
      //check if its a promotional content with links
      const tweetLinkElement = element.querySelector('article[data-testid="tweet"] div[data-testid="tweetText"] a');
      const hasLink=tweetLinkElement? true : false


      // Extract image URL
      const imageElement = element.querySelector('article[data-testid="tweet"] div[data-testid="tweetPhoto"] img');
      tweet.image = imageElement ? imageElement.getAttribute('src') : '';
      
      // Extract like, impression, retweet, and replies count
      const metricsElement = element.querySelector('article[data-testid="tweet"] div[data-testid="like"]');
      tweet.likes = metricsElement ? parseInt(metricsElement.innerText) : '';
      

      const retweetsElement = element.querySelector('article[data-testid="tweet"] div[data-testid="retweet"]');
      tweet.retweets = retweetsElement ? parseInt(retweetsElement.innerText) : '';
      
      const repliesElement = element.querySelector('article[data-testid="tweet"] div[data-testid="reply"]');
      tweet.replies = repliesElement ? parseInt(repliesElement.innerText) : '';
      
      // Extract video URL
      const videoElement = element.querySelector('article[data-testid="tweet"] div[data-testid="videoPlayer"]');
      tweet.video = videoElement ? videoElement.getAttribute('src') : '';
      
      // Extract img URL
      const imgElement = element.querySelector('article[data-testid="tweet"] div[data-testid="tweetPhoto"] img');
      tweet.img = imgElement ? imgElement.getAttribute('src') : '';
      
      !hasLink && extractedTweets.push(tweet);
      console.log(`extracted ${extractedTweets.length} tweets now...`)
    });
    
    return extractedTweets;
  });
  
  // Sort tweets by impressions
  console.log("sorting tweets...")
  const sortedTweets = tweets.sort((a, b) => b.retweets - a.retweets);
  
  // Save tweets to a JSON file
  console.log("saving tweets")
  await fs.writeFile('tweets.json', JSON.stringify(sortedTweets, null, 2));
  console.log("closing browser...")
  await browser.close();
  console.log("project done sucessfully...")

