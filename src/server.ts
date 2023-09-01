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
import Messages from "./Messages";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
const token = process.env.TOKEN;
const news_channel = process.env.NEWS_CHANNEL;
const general_channel = process.env.GENERAL_CHANNEL;
const domain = "news.ycombinator.com";
const FOUR_HOURS = 14400000;
const EIGHT_HOURS = FOUR_HOURS * 2;
let daySent = "";

client.once(Events.ClientReady, (c) => {
    console.log(`ready, logged in as ${c.user.tag}`);

    const newsChannel = client.channels.cache.get(news_channel as string);
    const generalChannel = client.channels.cache.get(general_channel as string);

    if (
        newsChannel &&
        generalChannel &&
        newsChannel.type === ChannelType.GuildText &&
        generalChannel.type === ChannelType.GuildText
    ) {
        const hackerNewsParser = new HackerNewsParser(newsChannel, domain);

        setInterval(async () => {
            await hackerNewsParser.sendPopular();

            const today = new Date();
            if (today.getDate() == 2 && today.toDateString() !== daySent) {
                daySent = today.toDateString();
                Messages.tellMembersToJoinCSIConnect(generalChannel);
            }

            hackerNewsParser.removeOldPosts();
        }, EIGHT_HOURS);
    } else {
        console.error("Channel not found or not a text channel.");
    }
});

client.login(token);
