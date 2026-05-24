import { injectable } from "tsyringe";

import { Command } from "@/core/commands/command";
import { CommandBus } from "@/core/commands/command-bus";
import { CommandHandler } from "@/core/commands/command-handler";

@injectable()
export class InMemoryCommandBus implements CommandBus {
  private readonly handlers = new Map<string, CommandHandler<Command, unknown>>();

  public register<C extends Command, R>(
    commandClass: { name: string },
    handler: CommandHandler<C, R>,
  ): void {
    this.handlers.set(commandClass.name, handler);
  }

  public async dispatch<R>(command: Command): Promise<R> {
    const name = command.constructor.name;
    const handler = this.handlers.get(name);

    if (!handler) {
      throw new Error(`No command handler registered for: ${name}`);
    }

    return handler.execute(command) as Promise<R>;
  }
}
