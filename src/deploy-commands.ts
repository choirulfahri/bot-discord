import { REST, Routes } from "discord.js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
// Opsional: Jika Anda sedang testing, gunakan GUILD_ID (ID server Discord Anda) agar command langsung muncul.
// Jika GUILD_ID tidak diisi, command akan diregistrasikan secara global (bisa memakan waktu hingga 1 jam).
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  console.error(
    "Kesalahan: DISCORD_TOKEN atau CLIENT_ID tidak ditemukan di file .env!",
  );
  process.exit(1);
}

const commands: any[] = [];
const foldersPath = path.join(__dirname, "commands");

// Membaca semua folder di dalam folder commands
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
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] Command di ${filePath} kehilangan properti "data" atau "execute" yang diwajibkan.`,
      );
    }
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(
      `Mulai me-refresh ${commands.length} application (/) commands...`,
    );

    let data: any;

    if (guildId) {
      // Deploy ke server/guild spesifik (Instan)
      data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
      console.log(
        `✅ Berhasil me-refresh ${data.length} commands untuk guild ${guildId}.`,
      );
    } else {
      // Deploy secara global
      data = await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });
      console.log(
        `✅ Berhasil me-refresh ${data.length} commands secara global.`,
      );
    }
  } catch (error) {
    console.error("❌ Terjadi kesalahan saat mendaftarkan commands:");
    console.error(error);
  }
})();
