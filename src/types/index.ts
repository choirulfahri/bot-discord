import {
  Collection,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { Kazagumo } from "kazagumo";

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, Command>;
    manager: Kazagumo;
  }
}

export interface Command {
  data: any;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
