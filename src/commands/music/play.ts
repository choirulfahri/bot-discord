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
      // Periksa apakah ada node yang aktif sebelum membuat player
      let node = interaction.client.manager.shoukaku.nodes.get("LocalNode");
      if (!node) {
        node = interaction.client.manager.shoukaku.getIdealNode();
      }

      if (!node) {
        await interaction.editReply(
          "❌ Oops! Mesin pemutar musik sedang offline atau sedang dipanaskan. Tunggu beberapa detik lalu coba lagi ya kak!",
        );
        return;
      }

      const player = await interaction.client.manager.createPlayer({
        guildId: interaction.guildId as string,
        textId: interaction.channelId,
        voiceId: voiceChannel.id,
        volume: 100,
        deaf: false,
      });

      let searchEngine = query.startsWith("http") ? query : query;
      let res = await interaction.client.manager.search(searchEngine);

      // Lapis 1 Fallback: YouTube Music (Seringkali aman dari block pencarian)
      if (res.tracks.length === 0 && !query.startsWith("http")) {
        console.log(
          `[Fallback 1] YT kosong untuk "${query}", coba YT Music...`,
        );
        res = await interaction.client.manager.search(`ytmsearch:${query}`);
      }

      // Lapis 2 Fallback: SoundCloud (Resolusi terakhir bila YouTube lumpuh total)
      if (res.tracks.length === 0 && !query.startsWith("http")) {
        console.log(
          `[Fallback 2] YTM kosong untuk "${query}", coba SoundCloud...`,
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
