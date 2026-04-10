import {
  Collection,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { DisTube } from "distube";

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, Command>;
    distube: DisTube;
  }
}

export interface Command {
  data: any;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
