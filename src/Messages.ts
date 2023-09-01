import { TextChannel } from "discord.js";

export default class Messages {
    static tellMembersToJoinCSIConnect(targetChannel: TextChannel) {
        targetChannel.send(
            `<@$${process.env.MEMBERS_ID}> NOTIFICATION: If you haven't already done so, please join the club on CSI Connect using the link is: [link](https://csi.campuslabs.com/engage/organization/csc).`
        );
    }
}
