import { container, Lifecycle } from "tsyringe";

import { CommandBus } from "@/core/commands/command-bus";
import { QueryBus } from "@/core/queries/query-bus";

import { InjectionTokens } from "../container/tokens";

import { InMemoryCommandBus } from "./adapters/in-memory/command-bus";
import { InMemoryQueryBus } from "./adapters/in-memory/query-bus";

export function setupBusContainer(): void {
  container.register<CommandBus>(
    InjectionTokens.Bus.Command,
    { useClass: InMemoryCommandBus },
    { lifecycle: Lifecycle.Singleton },
  );
  container.register<QueryBus>(
    InjectionTokens.Bus.Query,
    { useClass: InMemoryQueryBus },
    { lifecycle: Lifecycle.Singleton },
  );
}
