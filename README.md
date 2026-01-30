# Radiant Honeypot

Catches compromised accounts before they spam your server. Set up a bait channel, and anyone who messages in it gets kicked + their messages wiped.

## Setup

1. Create a bot at https://discord.com/developers/applications
2. Grab your token and enable these intents:
   - Message Content Intent
   - Server Members Intent

3. Invite with permissions: Kick Members, Manage Messages, Read Message History, Send Messages, View Channels

4. `npm install`

5. Make a `.env` file:
```
DISCORD_TOKEN=your_token
HONEYPOT_CHANNELS=channel_id,another_channel_id
LOG_CHANNEL_ID=where_to_log
DELETE_MESSAGE_COUNT=100
DELETE_MESSAGE_AGE=86400000
```

6. `npm start`

## Config

- `HONEYPOT_CHANNELS` - channel IDs to monitor, comma separated
- `LOG_CHANNEL_ID` - where kick logs go
- `DELETE_MESSAGE_COUNT` - how many messages to scan per channel (default 100)
- `DELETE_MESSAGE_AGE` - only delete messages newer than this in ms (default 24h)

## Usage

Make a channel called something like "free-nitro" or "giveaways". Pin a message telling real users not to type there. Compromised accounts running mass-DM scripts ignore warnings and message anyway. Bot catches them, kicks, cleans up.

Bot role needs to be above regular member roles to kick.
