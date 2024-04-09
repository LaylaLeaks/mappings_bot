require("dotenv").config();
const fs = require('fs');
const axios = require('axios');
const { WebhookClient, EmbedBuilder } = require('discord.js');
const { twitterClient } = require("./twitterClient.js");
const endpoint = "https://fortnitecentral.genxgames.gg/api/v1/mappings";
let data = [];

// Load data from mappings.js
const loadData = () => {
  try {
    const rawData = fs.readFileSync('mappings.json');
    data = JSON.parse(rawData);
  } catch (error) {
    console.error('Error:', error);
  }
};

const checkForUpdate = async () => {
  loadData();
  try {
    const res = await axios.get(endpoint);
    const newFileNames = res.data.map(item => item.fileName);

    const newMappings = newFileNames.filter(fileName => !data.some(item => item.fileName === fileName));

    if (newMappings.length > 0) {
      console.log("\u001b[32m[%s] NEW MAPPING FOUND\u001b[0m", newMappings[0]);

      // Create Discord embed
      const embed = new EmbedBuilder()
        .setTitle('New Mappings Found!')
        .addFields(
          {name: 'Version:', value: res.data.find(item => item.fileName === newMappings[0]).fileName},
          {name: 'Uploaded:', value: res.data.find(item => item.fileName === newMappings[0]).uploaded},
          {name: 'Hash:', value: res.data.find(item => item.fileName === newMappings[0]).hash},
          {name: 'URL:', value: res.data.find(item => item.fileName === newMappings[0]).url}
        )
        .setTimestamp()
        .setFooter({ text: 'made by @layla_leaks'});

      const webhookClient = new WebhookClient({ url: '<DISCORD_WEBHOOK_URL>' });
      const roleIdToPing = "<ROLE_ID>";
      webhookClient.send({
        content: `<@&${roleIdToPing}>`,
        embeds: [embed]
      });

      // Post to Twitter
      const tweetText = `Neue Mappings!\n\n${newMappings[0]}`;
      const tweet = async () => {
        try {
          await twitterClient.v2.tweet(tweetText);
        } catch (e) {
          console.log(e)
        }
      }

      tweet();
    } else {
      console.log("\u001b[31mNO NEW MAPPING\u001b[0m");
    }

    fs.writeFileSync('mappings.json', JSON.stringify(res.data, null, 2));
    data = res.data;
  } catch (error) {
    console.error('Error:', error);
  }
  setTimeout(checkForUpdate, 5000); // Every 5 Sekunden checking for new mappings!
};

loadData();
checkForUpdate();

// Need help?
// Dm me on Discord!
// Username: layla.06