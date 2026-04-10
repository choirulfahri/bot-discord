import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";
import { Command } from "../../types";

const skipCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription(
      "Untuk melewati lagu yang sedang diputar dan memutar lagu berikutnya di antrean",
    ),
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

    if (queue.songs.length <= 1 && !queue.autoplay) {
      queue.stop();
      await interaction.reply(
        "Lagu selanjutnya tidak ada kak, aku berhentiin ya putar lagunya",
      );
    } else {
      await queue.skip();
      await interaction.reply("Aku udah skip lagunya ya kak");
    }
  },
};

export default skipCommand;
