import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../types";

const queueCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Melihat daftar antrean lagu saat ini"),
  async execute(interaction: ChatInputCommandInteraction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId!);
    if (!queue) {
      await interaction.reply({
        content: "Kakak, Kamu belum memutar musik nih, coba deh putar dulu:)",
        ephemeral: true,
      });
      return;
    }

    const q = queue.songs
      .map(
        (song, i) =>
          `${i === 0 ? "Aku lagi Putar lagu:" : `**${i}.**`} ${song.name} - \`${song.formattedDuration}\``,
      )
      .slice(0, 10)
      .join("\n");

    await interaction.reply(
      `Ini antrian lagunya kak \n${q}\n${queue.songs.length > 10 ? ` ${queue.songs.length - 10} lagu lainnya.` : ""}`,
    );
  },
};

export default queueCommand;
