# Radiant Honeypot

A Discord bot that catches compromised accounts by monitoring honeypot channels. When a user messages in a honeypot channel, the bot kicks them and deletes their recent messages across the server.

## Setup

1. Create a Discord application at https://discord.com/developers/applications
2. Enable the bot and get your token
3. Enable these privileged intents:
   - Message Content Intent
   - Server Members Intent

4. Invite the bot with these permissions:
   - Kick Members
   - Manage Messages
   - Read Message History
   - Send Messages
   - View Channels

5. Install dependencies:
```
npm install
```

6. Create a `.env` file (copy from `.env.example`):
```
DISCORD_TOKEN=your_bot_token_here
HONEYPOT_CHANNELS=1234567890,0987654321
LOG_CHANNEL_ID=your_log_channel_id
DELETE_MESSAGE_COUNT=100
DELETE_MESSAGE_AGE=86400000
```

7. Run the bot:
```
npm start
```

## Configuration

| Variable | Description |
|----------|-------------|
| DISCORD_TOKEN | Your bot token |
| HONEYPOT_CHANNELS | Comma-separated channel IDs to monitor |
| LOG_CHANNEL_ID | Channel where kicks are logged |
| DELETE_MESSAGE_COUNT | Max messages to fetch per channel (default: 100) |
| DELETE_MESSAGE_AGE | Max message age in ms to delete (default: 24 hours) |

## How It Works

1. Create a channel with a tempting name (e.g., "free-nitro", "giveaways")
2. Set up a message warning legitimate users not to chat
3. Compromised accounts running spam scripts will message regardless
4. The bot kicks them instantly and cleans up their messages

## Required Bot Permissions

The bot needs to be placed higher in the role hierarchy than regular members to kick them.
