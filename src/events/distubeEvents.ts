import { Client, TextChannel } from "discord.js";

export = (client: Client, sendErrorToDev: Function) => {
  client.distube
    .on("playSong" as any, (queue: any, song: any) => {
      if (queue.textChannel) {
        (queue.textChannel as TextChannel).send(
          `Aku lagi Putar lagu: \`${song.name}\` - \`${song.formattedDuration}\`\nRequestnya kakak: ${song.user}`,
        );
      }
    })
    .on("addSong" as any, (queue: any, song: any) => {
      if (queue.textChannel) {
        (queue.textChannel as TextChannel).send(
          `Lagunya udah aku tambahin ke antrian: \`${song.name}\` - \`${song.formattedDuration}\``,
        );
      }
    })
    .on("error" as any, (channel: any, error: any) => {
      // Kirim error teknis ke DM atau log console
      sendErrorToDev(error, "Music System (DisTube)");

      if (channel) {
        // Pesan Publik yang Ramah Pengguna (Hanya teks biasa, tidak ada debugger js)
        (channel as TextChannel).send(
          `Sebentar kak ada masalah teknis \nMaaf kak, proses lagu terhenti sesaat. Jangan khawatir, kak developer sudah menerima laporan error ini dan akan segera memperbaikinya!`,
        );
      }
    });
};
