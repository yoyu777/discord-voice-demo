require('dotenv').config()

const { spawn } = require('child_process');
const fs = require('fs')

const speech = require('@google-cloud/speech');
const { Client, Intents, VoiceChannel } = require('discord.js');

const VOICE_CHANNEL_ID = '845384132388192306'

class Broadcaster {
    constructor() {
        this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

        this.client.login(process.env.DISCORD_BOT_TOKEN);

        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user.tag}!`);
            this.joinVoiceChannel(VOICE_CHANNEL_ID)
                .catch(console.error)
        });

        this.client.on('message', message => {
            if (message.content == 'play') {
                this.playStory()
                message.channel.send(':speech_balloon: Playing stotry')
            }
            if (message.content == 'stop') {
                this.stopStory()
                message.channel.send(':zipper_mouth: Stop playing')
            }
        });
    }


    joinVoiceChannel(voiceChannelId) {
        return this.client.channels.fetch(voiceChannelId)
            .then(channel => channel.join())
            .then(connection => this.voiceConnection = connection)
    }

    playStory() {
        this.broadcast = this.voiceConnection.play('audio/katie-weather.mp3')
        return this.broadcast
    }

    stopStory() {
        if (this.broadcast) {
            this.broadcast.end()
            this.broadcast = null
        }
    }

}

class Transcriber {
    constructor() {
        this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

        this.client.login('ODYxNTM1MDE2MDkzMzUxOTQ2.YOLNAg.CA7KiaKMCAATSFLjc8aQF7eEXQc');

        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user.tag}!`);
            this.joinVoiceChannel(VOICE_CHANNEL_ID)
                .catch(console.error)
        });

        this.client.on('message', message => {
            if (message.content == 'listen') {
                this.listen(message.author, message.channel)
            }

        });

        this.client.on('message', message => {
            if (message.content == 'trans') {
                this.transcribe()
            }
        });
    }


    joinVoiceChannel(voiceChannelId) {
        return this.client.channels.fetch(voiceChannelId)
            .then(channel => channel.join())
            .then(connection => this.voiceConnection = connection)
    }

    listen(user, channel) {
        channel.send(':ear: I\'m listening')
        this.getStream(user).on('close', () => {
            channel.send(':pencil2:  Transcribing...')
            const conversion = spawn('ffmpeg',
                [
                    '-f', 's16le',
                    '-vn',
                    '-ar', '48k',
                    '-ac', '2',
                    '-i', 'audio_s16le.raw',
                    '-acodec', 'pcm_s16le',
                    '-ar', '16k',
                    '-ac', '1',
                    'audio_LINEAR16.wav',
                    '-y'
                ])
            conversion.on('close', () => {
                this.transcribe(transcription => {
                    channel.send(transcription)
                })
            })
        })
    }


    getStream(user) {
        // Create a ReadableStream of s16le PCM audio
        const audio = this.voiceConnection.receiver.createStream(user, { mode: 'pcm' });
        const file = fs.createWriteStream('audio_s16le.raw')
        audio.pipe(file);
        return file
    }

    transcribe(callback) {
        // Creates a client
        const client = new speech.SpeechClient();

        const streamingConfig = {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
        }

        /* For streaming transcription (WIP)

        const streamRequest = {
            config: streamingConfig,
            singleUtterance: true,
            interimResults: true, //Get interim results from stream
        };

        // Stream the audio to the Google Cloud Speech API
        const recognizeStream = client
            .streamingRecognize(request)
            .on('error', console.error)
            .on('data', data => {
                console.log(
                    `Transcription: ${data.results[0].alternatives[0].transcript}`
                );
            });

        // Stream an audio file from disk to the Speech API, e.g. "./resources/audio.raw"
        fs.createReadStream(filename).pipe(recognizeStream);

        */


        client.recognize({
            config: streamingConfig,
            audio: {
                content: fs.readFileSync('audio_LINEAR16.wav').toString('base64')
            }
        }).then(([response]) => {
            const transcription = response.results.map(result => result.alternatives[0].transcript).join('\n');
            console.log(transcription)
            callback(transcription)
        })
    }

}

new Broadcaster()
new Transcriber()
