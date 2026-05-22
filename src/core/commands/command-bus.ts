import { Command } from "./command";

export interface CommandBus {
  dispatch<R>(command: Command): Promise<R>;
}
