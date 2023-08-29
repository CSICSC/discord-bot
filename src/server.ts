import {
    Client,
    Events,
    REST,
    Routes,
    GatewayIntentBits,
    ChannelType,
} from "discord.js";
import "dotenv/config";
import HackerNewsParser from "./HackerNewsParser";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
const token = process.env.TOKEN;
const news_channel = process.env.NEWS_CHANNEL;
const domain = "news.ycombinator.com";
const FOUR_HOURS = 14400000;
const EIGHT_HOURS = FOUR_HOURS * 2;

client.once(Events.ClientReady, (c) => {
    console.log(`ready, logged in as ${c.user.tag}`);

    const targetChannel = client.channels.cache.get(news_channel as string);

    if (targetChannel && targetChannel.type === ChannelType.GuildText) {
        const hackerNewsParser = new HackerNewsParser(targetChannel, domain);

        setInterval(async () => {
            await hackerNewsParser.sendPopular();

            hackerNewsParser.removeOldPosts();
        }, EIGHT_HOURS);
    } else {
        console.error("Channel not found or not a text channel.");
    }
});

client.login(token);
