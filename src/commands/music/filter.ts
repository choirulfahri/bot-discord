import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";
import { Command } from "../../types";

const filterCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("filter")
    .setDescription(
      "Ini kakak bisa ubah gaya musiknya dengan filter yang tersedia",
    )
    .addStringOption((option) =>
      option
        .setName("tipe")
        .setDescription(
          "Kakak pilih filter yang ingin digunakan atau dimatikan",
        )
        .setRequired(true)
        .addChoices(
          { name: "Bassboost", value: "bassboost" },
          { name: "Nightcore", value: "nightcore" },
          { name: "Off (Matikan Filter)", value: "off" },
        ),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const filterType = interaction.options.getString("tipe", true);
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      await interaction.reply({
        content: "Maaf, Kakak harus ada di dalam voice ya:)",
        ephemeral: true,
      });
      return;
    }

    const queue = interaction.client.distube.getQueue(interaction.guildId!);
    if (!queue) {
      await interaction.reply({
        content: "Kakak, Kamu belum memutar musik nih, coba deh putar dulu:)",
        ephemeral: true,
      });
      return;
    }

    if (filterType === "off") {
      queue.filters.clear();
      await interaction.reply("Kak, Mode lagu nya udah kembali ke normal ya:)");
    } else {
      if (queue.filters.has(filterType)) {
        queue.filters.remove(filterType);
        await interaction.reply(
          `Kakak Filter \`${filterType}\` nya aku matikan ya.`,
        );
      } else {
        queue.filters.add(filterType);
        await interaction.reply(
          `Kakak Filter \`${filterType}\` nya aku aktifkan ya.`,
        );
      }
    }
  },
};

export default filterCommand;
