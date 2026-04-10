import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";
import { Command } from "../../types";
import play from "play-dl"; // Bypass Pencarian YouTube

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
      let finalQuery = query;

      // BYPASS: Jika input hanya teks bukan link, gunakan pencari Play-DL yang kebal blokir VPS!
      if (!query.startsWith("http")) {
        try {
          const searchResults = await play.search(query, { limit: 1 });
          if (searchResults && searchResults.length > 0) {
            finalQuery = searchResults[0].url; // Ambil Link Asli
          } else {
            await interaction.editReply(
              "Maaf kak, pencarian YouTube tidak menemukan hasil dari judul itu :(",
            );
            return;
          }
        } catch (searchError) {
          console.error("Play-DL search error:", searchError);
          // Fallback terakhir: Coba cari otomatis lewat SoundCloud jika YouTube mati total
          finalQuery = `scsearch:${query}`;
        }
      }

      await interaction.client.distube.play(voiceChannel, finalQuery, {
        member: member,
        textChannel: interaction.channel as any,
      });

      await interaction.editReply(
        `Berhasil menemukan: \`${query}\`! Sedang memproses...`,
      );
    } catch (error) {
      console.error(error);
      await interaction.editReply(
        "Maaf kak, aku gak bisa memutar lagu itu. YouTube memblokir akses ke lagu tersebut.",
      );
    }
  },
};

export default playCommand;
