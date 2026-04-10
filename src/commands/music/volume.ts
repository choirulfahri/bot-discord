import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";
import { Command } from "../../types";

const volumeCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Mengubah volume musik")
    .addIntegerOption((option) =>
      option
        .setName("angka")
        .setDescription("Volume (0-100)")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(100),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const volume = interaction.options.getInteger("angka", true);
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

    queue.setVolume(volume);
    await interaction.reply(`Volumenya aku ubah jadi \`${volume}%\``);
  },
};

export default volumeCommand;
