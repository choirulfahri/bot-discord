import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";
import { Command } from "../../types";

const stopCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Untuk Memberhentikan lagu"),
  async execute(interaction: ChatInputCommandInteraction) {
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
        content: "Maaf, Kakak belum memutar musik nih, coba deh putar dulu:)",
        ephemeral: true,
      });
      return;
    }

    queue.stop();
    interaction.client.distube.voices.leave(interaction.guildId!);
    await interaction.reply("Musiknya aku berhentiin ya kak");
  },
};

export default stopCommand;
