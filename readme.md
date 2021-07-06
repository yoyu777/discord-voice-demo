
# Discord Voice Bot Demo

This is a demo of the voice feature of Discord API, via Discord.js SDK. 
- The Broadcast bot can play an audio file in a voice channel
- The Transcriber bot can listen to a user and transcribe what they say


## How to run the bot
 
1. Prerequisites:

- Install `ffmpeg`: http://ffmpeg.org/
- Create a Google Cloud project, enable the `Speech` API
- Have a service account ready, create and download the JSON credentials

2. Install node.js dependencies 

```
npm install
```

3. Create a `.env` file in the root directory

```
GOOGLE_APPLICATION_CREDENTIALS=[path to the JSON credentials]
DISCORD_BOT_TOKEN=[your Discord bot token]
```

4. Run the bot

```
npm start
```

## Interact with the bot

- `play`: to play the audio file
- `stop`: to stop playing the audio file
- `listen`: listen to the speech and transcribe

