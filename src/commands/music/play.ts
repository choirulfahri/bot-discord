import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  TextChannel,
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
      const player = await interaction.client.manager.createPlayer({
        guildId: interaction.guildId as string,
        textId: interaction.channelId,
        voiceId: voiceChannel.id,
        volume: 100,
        deaf: true,
      });

      let res = await interaction.client.manager.search(query);

      // --- Sistem Fallback Cerdas (Anti Blank) ---
      // Jika pencarian YouTube kosong (karena error plugin atau diblokir), otomatis membelokkan pencarian ke SoundCloud
      if (res.tracks.length === 0 && !query.startsWith("http")) {
        console.log(
          `[Fallback] YouTube diblokir/kosong untuk "${query}", mencoba memutar dari SoundCloud...`,
        );
        res = await interaction.client.manager.search(`scsearch:${query}`);
      }

      if (res.tracks.length === 0) {
        await interaction.editReply(
          "Pencarian tidak menemukan hasil apapun di YouTube maupun SoundCloud :(",
        );
        return;
      }

      if (res.type === "PLAYLIST") {
        for (const track of res.tracks) {
          player.queue.add(track);
        }
        await interaction.editReply(
          `Memasukkan **${res.tracks.length}** lagu dari playlist ke antrean!`,
        );
      } else {
        player.queue.add(res.tracks[0]);
        await interaction.editReply(
          `Berhasil menemukan: **${res.tracks[0].title}**! Menambahkan ke antrean...`,
        );
      }

      if (!player.playing && !player.paused) {
        player.play();
      }
    } catch (error) {
      console.error(error);
      await interaction.editReply(
        "Maaf kak, terjadi kesalahan sistem saat mencoba memutar lagu dari mesin utama.",
      );
    }
  },
};

export default playCommand;
