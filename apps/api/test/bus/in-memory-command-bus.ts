import { Command } from "@/core/commands/command";
import { CommandBus } from "@/core/commands/command-bus";
import { CommandHandler } from "@/core/commands/command-handler";

export class InMemoryCommandBus implements CommandBus {
  public dispatched: Command[] = [];

  public register<C extends Command, R>(
    _commandClass: new (...args: never[]) => C,
    _handler: CommandHandler<C, R>,
  ): void {
    // Not needed for tests that only spy on dispatched commands.
  }

  public async dispatch<R>(command: Command): Promise<R> {
    this.dispatched.push(command);
    return Promise.resolve(undefined as R);
  }
}
