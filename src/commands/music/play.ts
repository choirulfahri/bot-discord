import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  TextChannel,
} from "discord.js";
import { Command } from "../../types/index";
import { useMainPlayer } from "discord-player";

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
    const voiceChannel = member.voice?.channel;

    if (!voiceChannel) {
      await interaction.reply({
        content: "Maaf, Kakak harus ada di dalam voice ya:)",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    try {
      const player = useMainPlayer();
      const result = await player.search(query, {
        requestedBy: interaction.user,
      });

      if (!result.hasTracks()) {
        await interaction.editReply("❌ Pencarian tidak menemukan hasil di platform manapun.");
        return;
      }

      await player.play(voiceChannel, result, {
        nodeOptions: {
          metadata: interaction.channel as TextChannel,
          volume: 100,
          leaveOnEmpty: true,
          leaveOnEmptyCooldown: 300000,
          leaveOnEnd: false,
        },
      });

      const t = result.tracks[0];
      await interaction.editReply(
        `Berhasil memuat: **${result.playlist ? result.playlist.title : t.title}**! Menambahkan ke antrean...`
      );
    } catch (error) {
      console.error(error);
      await interaction.editReply(
        "Maaf kak, terjadi kesalahan sistem saat mencoba memutar lagu dari mesin baru.",
      );
    }
  },
};

export default playCommand;
