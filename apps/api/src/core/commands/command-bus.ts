import { Command } from "./command";
import { CommandHandler } from "./command-handler";

export interface CommandBus {
  register<C extends Command, R>(
    commandClass: new (...args: never[]) => C,
    handler: CommandHandler<C, R>,
  ): void;
  dispatch<R>(command: Command): Promise<R>;
}
