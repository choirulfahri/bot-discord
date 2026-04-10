import {
  Client,
  GatewayIntentBits,
  Collection,
  TextChannel,
  EmbedBuilder,
} from "discord.js";
import { Kazagumo, KazagumoTrack } from "kazagumo";
import { Connectors } from "shoukaku";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
// Import file module Types agar TypeScript mengenali client.commands dan client.manager
import "./types";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

// Inisialisasi Collection untuk commands
client.commands = new Collection();

// --- Konfigurasi Lavalink Node ---
const Nodes = [
  {
    name: "LocalNode",
    url: "127.0.0.1:2333", // Port default lavalink
    auth: "youshallnotpass", // Password default sesuai application.yml
    secure: false, // Karena kita pakai localhost HTTP biasa
  },
];

client.manager = new Kazagumo(
  {
    defaultSearchEngine: "youtube",
    send: (guildId, payload) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) guild.shard.send(payload);
    },
  },
  new Connectors.DiscordJS(client),
  Nodes,
  {
    moveOnDisconnect: false,
    resume: true,
    resumeTimeout: 60,
    reconnectInterval: 10000,
    reconnectTries: 60,
    restTimeout: 15000,
  },
);

// Event jika node siap
client.manager.shoukaku.on("ready", (name) =>
  console.log(`✓ Node ${name} terhubung!`),
);
client.manager.shoukaku.on("error", (name, error) =>
  console.error(`❌ Node ${name} error:`, error),
);
client.manager.shoukaku.on("close", (name, code, reason) =>
  console.warn(`⚠ Node ${name} terputus (Code: ${code}, Reason: ${reason})`),
);

// Event Pemutar Lagu Kazagumo
client.manager.on("playerStart", (player, track) => {
  const channel = player.textId
    ? (client.channels.cache.get(player.textId) as TextChannel)
    : null;
  if (channel) {
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setDescription(`🎶 Sedang memainkan: **${track.title}**`)
      .setFooter({
        text: `Diminta oleh: ${(track.requester as any)?.user?.username || track.author}`,
      });
    channel.send({ embeds: [embed] }).catch(() => {});
  }
});

client.manager.on("playerEmpty", (player) => {
  const channel = player.textId
    ? (client.channels.cache.get(player.textId) as TextChannel)
    : null;
  if (channel) {
    channel
      .send("Meninggalkan saluran karena lagu telah habis.")
      .catch(() => {});
  }
  player.destroy(); // Keluar dari voice channel
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
