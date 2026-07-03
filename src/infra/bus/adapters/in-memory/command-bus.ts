import { injectable } from "tsyringe";

import { Command } from "@/core/commands/command";
import { CommandBus } from "@/core/commands/command-bus";
import { CommandHandler } from "@/core/commands/command-handler";

@injectable()
export class InMemoryCommandBus implements CommandBus {
  private readonly handlers = new Map<object, CommandHandler<Command, unknown>>();

  public register<C extends Command, R>(
    commandClass: new (...args: never[]) => C,
    handler: CommandHandler<C, R>,
  ): void {
    if (this.handlers.has(commandClass)) {
      throw new Error(`Command handler already registered for: ${commandClass.name}`);
    }

    this.handlers.set(commandClass, handler);
  }

  public async dispatch<R>(command: Command): Promise<R> {
    const handler = this.handlers.get(command.constructor);

    if (!handler) {
      throw new Error(`No command handler registered for: ${command.constructor.name}`);
    }

    return handler.execute(command) as Promise<R>;
  }
}
