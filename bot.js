const { Client, GatewayIntentBits, Partials, EmbedBuilder, AuditLogEvent } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Message, Partials.Channel]
});

const config = {
    token: process.env.DISCORD_TOKEN,
    honeypotChannelIds: process.env.HONEYPOT_CHANNELS?.split(',') || [],
    logChannelId: process.env.LOG_CHANNEL_ID,
    deleteMessageCount: parseInt(process.env.DELETE_MESSAGE_COUNT) || 100,
    deleteMessageAge: parseInt(process.env.DELETE_MESSAGE_AGE) || 86400000
};

client.once('ready', () => {
    console.log(`Radiant Honeypot is online as ${client.user.tag}`);
    console.log(`Monitoring ${config.honeypotChannelIds.length} honeypot channel(s)`);
    
    client.user.setPresence({
        activities: [{ name: 'for compromised accounts', type: 3 }],
        status: 'dnd'
    });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!config.honeypotChannelIds.includes(message.channel.id)) return;

    const member = message.member;
    const user = message.author;

    console.log(`[HONEYPOT TRIGGERED] User: ${user.tag} (${user.id}) in channel: ${message.channel.name}`);

    try {
        await message.delete().catch(() => {});
    } catch (err) {}

    const deletedCount = await deleteUserMessages(message.guild, user.id);

    try {
        await member.kick('Radiant Honeypot: Triggered honeypot channel (likely compromised account)');
        console.log(`[KICKED] ${user.tag} (${user.id})`);
    } catch (err) {
        console.error(`[ERROR] Failed to kick ${user.tag}: ${err.message}`);
    }

    await sendLog(message.guild, user, message.content, deletedCount, message.channel);
});

async function deleteUserMessages(guild, userId) {
    let totalDeleted = 0;
    const cutoffTime = Date.now() - config.deleteMessageAge;

    const channels = guild.channels.cache.filter(ch => ch.isTextBased() && ch.permissionsFor(guild.members.me)?.has('ManageMessages'));

    for (const [, channel] of channels) {
        try {
            const messages = await channel.messages.fetch({ limit: config.deleteMessageCount });
            const userMessages = messages.filter(msg => 
                msg.author.id === userId && 
                msg.createdTimestamp > cutoffTime &&
                !msg.pinned
            );

            if (userMessages.size > 0) {
                const deleted = await channel.bulkDelete(userMessages, true).catch(() => ({ size: 0 }));
                totalDeleted += deleted.size || 0;
            }
        } catch (err) {}
    }

    console.log(`[CLEANUP] Deleted ${totalDeleted} messages from user ${userId}`);
    return totalDeleted;
}

async function sendLog(guild, user, triggerMessage, deletedCount, triggerChannel) {
    if (!config.logChannelId) return;

    const logChannel = guild.channels.cache.get(config.logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🍯 Honeypot Triggered')
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
            { name: 'User', value: `${user.tag}\n<@${user.id}>`, inline: true },
            { name: 'User ID', value: user.id, inline: true },
            { name: 'Account Age', value: getAccountAge(user.createdAt), inline: true },
            { name: 'Trigger Channel', value: `<#${triggerChannel.id}>`, inline: true },
            { name: 'Messages Deleted', value: `${deletedCount}`, inline: true },
            { name: 'Action', value: 'Kicked', inline: true },
            { name: 'Trigger Message', value: triggerMessage.substring(0, 1024) || '[No content]' }
        )
        .setTimestamp()
        .setFooter({ text: 'Radiant Honeypot' });

    try {
        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error(`[ERROR] Failed to send log: ${err.message}`);
    }
}

function getAccountAge(createdAt) {
    const diff = Date.now() - createdAt.getTime();
    const days = Math.floor(diff / 86400000);
    
    if (days < 1) return 'Less than a day';
    if (days < 30) return `${days} day(s)`;
    if (days < 365) return `${Math.floor(days / 30)} month(s)`;
    return `${Math.floor(days / 365)} year(s)`;
}

client.on('error', (error) => {
    console.error('[ERROR]', error);
});

client.login(config.token);
