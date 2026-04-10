import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";
import { Command } from "../../types";

const playCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Kakak bisa memutar musik dengan perintah ini")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Judul lagu atau URL yang ingin diputar")
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString("query", true);
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      await interaction.reply({
        content: "Maaf, Kakak harus ada di dalam voice ya:)",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    try {
      await interaction.client.distube.play(voiceChannel, query, {
        member: member,
        textChannel: interaction.channel as any,
      });
      await interaction.editReply(
        `Sebentar ya kak aku cariin dulu lagunya : \`${query}\``,
      );
    } catch (error) {
      console.error(error);
      await interaction.editReply(
        "Maaf kak, aku gak bisa memutar lagu itu. Coba pastikan judul atau URL nya benar ya:)",
      );
    }
  },
};

export default playCommand;
