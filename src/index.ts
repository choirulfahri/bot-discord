import {
  Client,
  GatewayIntentBits,
  Collection,
  TextChannel,
  EmbedBuilder,
} from "discord.js";
import { Player } from "discord-player";
import { DefaultExtractors } from "@discord-player/extractor";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import "./types/index";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

client.commands = new Collection();

// --- Konfigurasi Discord Player (Pengganti Lavalink) ---
const player = new Player(client);
client.player = player;

// Register audio extractors (YouTube, SoundCloud, Spotify, dll)
player.extractors.loadMulti(DefaultExtractors);

// Event Pemutar Lagu Discord Player
player.events.on('playerStart', (queue, track) => {
  const channel = queue.metadata as TextChannel;
  if (channel) {
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setDescription(`Ìæ∂ Sedang memainkan: **${track.title}**`)
      .setFooter({
        text: `Diminta oleh: ${track.requestedBy?.username || "Seseorang"}`,
      });
    channel.send({ embeds: [embed] }).catch(() => {});
  }
});

player.events.on('emptyQueue', (queue) => {
  const channel = queue.metadata as TextChannel;
  if (channel) {
    channel.send("Meninggalkan saluran karena lagu telah habis.").catch(() => {});
  }
});

player.events.on('error', (queue, error) => {
  console.log(`[Error dari Player]: ${error.message}`);
});

player.events.on('playerError', (queue, error) => {
  console.log(`[Error dari Audio Connection]: ${error.message}`);
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
client.once("ready", () => {
  console.log(`Hallo kak aku sudah siap! ${client.user?.tag}!`);
});

// --- Global Error Handlers (Anti-Crash) ---
const sendErrorToDev = async (error: any, context: string) => {
  console.error(`[${context}]`, error);
  if (!process.env.DEVELOPER_ID || !client.isReady()) return;
  try {
    const dev = await client.users.fetch(process.env.DEVELOPER_ID);
    if (dev) {
      const debugInfo = error instanceof Error ? error.stack : String(error);
      await dev.send(
        `‚ùå **CRITICAL: Sistem Mendeteksi Error (${context})**\n<@${process.env.DEVELOPER_ID}>, segera periksa log ini:\n**Debugger:**\n\`\`\`js\n${String(debugInfo).slice(0, 1800)}\n\`\`\``,
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
    sendErrorToDev(error, `Command: /${interaction.commandName}`);
    const errMsg = `‚ùå Maaf kak, terjadi kesalahan! Laporan teknis sudah dikirim diam-diam ke Developer untuk segera diperbaiki.`;
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errMsg, ephemeral: true });
    } else {
      await interaction.reply({ content: errMsg, ephemeral: true });
    }
  }
});

process.on("unhandledRejection", (reason, promise) => {
  sendErrorToDev(reason, "Unhandled Rejection");
});

process.on("uncaughtException", (error) => {
  sendErrorToDev(error, "Uncaught Exception");
});

const gracefulShutdown = () => {
  console.log("Menerima perintah Restart/Stop (PM2). Bot sedang log out...");
  client.destroy();
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

if (!process.env.DISCORD_TOKEN) {
  console.error("‚ùå Kesalahan: DISCORD_TOKEN tidak ditemukan di file .env");
  process.exit(1);
}
client.login(process.env.DISCORD_TOKEN);
