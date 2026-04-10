import { Client, GatewayIntentBits, Collection } from "discord.js";
import { DisTube } from "distube";
import { YouTubePlugin } from "@distube/youtube";
import { SpotifyPlugin } from "@distube/spotify";
import { SoundCloudPlugin } from "@distube/soundcloud";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
// Import file module Types agar TypeScript mengenali client.commands dan client.distube
import "./types";

dotenv.config();

// Mengatur FFMPEG_PATH secara global agar modul lain seperti prism-media (bawaan Discord.js Voice) dapat membacanya.
const ffmpegPath = require("ffmpeg-static");
process.env.FFMPEG_PATH = require("ffmpeg-static");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

// Inisialisasi Collection untuk commands
client.commands = new Collection();

// Inisialisasi DisTube dengan YouTubePlugin
console.log("===============================");
console.log("FFMPEG PATH is: ", ffmpegPath);
console.log("===============================");
client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
  plugins: [
    new YouTubePlugin({
      cookies: [],
    }),
    new SpotifyPlugin(),
    new SoundCloudPlugin(),
  ],
  ffmpeg: {
    path: ffmpegPath,
  },
  joinNewVoiceChannel: true,
});

// --- Command Handler ---
const foldersPath = path.join(__dirname, "commands");
if (fs.existsSync(foldersPath)) {
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath).default;

      if (command && "data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.log(
          `[WARNING] Command di ${filePath} kehilangan properti "data" atau "execute" yang diwajibkan.`,
        );
      }
    }
  }
}

// --- Discord Event Handler ---
client.once("clientReady", () => {
  console.log(`Hallo kak aku sudah siap! ${client.user?.tag}!`);
  console.log(
    "Di dalam DisTube options, path disetel ke: ",
    client.distube.options.ffmpeg.path,
  );
});

// --- Global Error Handlers (Anti-Crash) ---
// Akan otomatis menangkap semua error bot dan mengirim pesan via DM (Direct Message) ke developer
const sendErrorToDev = async (error: any, context: string) => {
  console.error(`[${context}]`, error);
  if (!process.env.DEVELOPER_ID || !client.isReady()) return;
  try {
    const dev = await client.users.fetch(process.env.DEVELOPER_ID);
    if (dev) {
      const debugInfo = error instanceof Error ? error.stack : String(error);
      await dev.send(
        `❌ **CRITICAL: Sistem Mendeteksi Error (${context})**\n<@${process.env.DEVELOPER_ID}>, segera periksa log ini:\n**Debugger:**\n\`\`\`js\n${String(debugInfo).slice(0, 1800)}\n\`\`\``,
      );
    }
  } catch (e) {
    console.error("Gagal mengirim DM ke developer:", e);
  }
};

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error("Interaction Error:", error);

    // Kirim laporan detail beserta debugger ke DM Developer
    sendErrorToDev(error, `Command: /${interaction.commandName}`);

    // Tampilkan pesan yang ramah kepada pengguna (tanpa kode teknis)
    const errMsg = `❌ Maaf kak, terjadi kesalahan! Laporan teknis sudah dikirim diam-diam ke Developer untuk segera diperbaiki.`;

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: errMsg,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: errMsg,
        ephemeral: true,
      });
    }
  }
});

// --- DisTube Event Handler Loader ---
require("./events/distubeEvents")(client, sendErrorToDev);

process.on("unhandledRejection", (reason, promise) => {
  sendErrorToDev(reason, "Unhandled Rejection");
});

process.on("uncaughtException", (error) => {
  sendErrorToDev(error, "Uncaught Exception");
});

// --- Graceful Shutdown (Mematikan bot aman, otomatis keluar dari Voice) ---
const gracefulShutdown = () => {
  console.log("Menerima perintah Restart/Stop (PM2). Bot sedang log out...");
  client.destroy();
  process.exit(0);
};

// Menangkap sinyal dari PM2 saat diperintah restart/stop
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Login
if (!process.env.DISCORD_TOKEN) {
  console.error("❌ Kesalahan: DISCORD_TOKEN tidak ditemukan di file .env");
  process.exit(1);
}
client.login(process.env.DISCORD_TOKEN);
