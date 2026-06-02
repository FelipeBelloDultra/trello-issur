import { Command } from "./command";
import { CommandHandler } from "./command-handler";

export interface CommandBus {
  register<C extends Command, R>(
    commandClass: { name: string },
    handler: CommandHandler<C, R>,
  ): void;
  dispatch<R>(command: Command): Promise<R>;
}
