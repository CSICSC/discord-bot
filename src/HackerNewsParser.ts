import axios from "axios";
import { load } from "cheerio";
import { TextChannel } from "discord.js";

type Title = string;
type Link = string;
type DateNow = number;

interface Max {
    value: number;
    map?: [Title, [Link, DateNow]];
}

export default class HackerNewsParser {
    private targetChannel: TextChannel;
    private domain: string;
    private displayedMap = new Map<Title, [Link, DateNow]>();
    private readonly ONE_WEEK = 1.728 * 1e8;

    constructor(targetChannel: TextChannel, domain: string) {
        this.targetChannel = targetChannel;
        this.domain = domain;
    }

    async sendPopular() {
        const { data } = await axios.get(`https://${this.domain}`);

        if (!data) {
            this.targetChannel.send("hackernews is empty!");
        }

        const $ = load(data);
        const max: Max = {
            value: Number.MIN_VALUE,
        };

        $("tr.athing").each((i, el) => {
            const next = el.next;
            const points = $(next!).find(".score").text().split(" ")[0];
            const title = $(el).find(".title a").first().text();
            const link = $(el).find(".title a").first().attr("href") as string;
            const date = Date.now();

            if (Number(points) > max.value && !this.displayedMap.has(title)) {
                max.value = Number(points);
                max.map = [title, [link, date]];
            }
        });

        if (max.map === undefined)
            this.targetChannel.send("hackernews points system changed!");
        else {
            this.targetChannel.send(
                `(${max.value} points) [${max.map[0]}](${max.map[1][0]})`
            );
            this.displayedMap.set(max.map[0], max.map[1]);
        }
    }

    removeOldPosts() {
        for (const [title, [link, date]] of this.displayedMap) {
            if (Date.now() - date > this.ONE_WEEK) {
                this.displayedMap.delete(title);
            }
        }
    }
}
