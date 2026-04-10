const { Client, GatewayIntentBits } = require("discord.js");
const { DisTube } = require("distube");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
const ffmpegPath = require("ffmpeg-static");
console.log("FFMPEG PATH from require:", typeof ffmpegPath, ffmpegPath);
const distube = new DisTube(client, {
  ffmpeg: { path: ffmpegPath }
});
console.log("DisTube options path:", distube.options.ffmpeg.path);
