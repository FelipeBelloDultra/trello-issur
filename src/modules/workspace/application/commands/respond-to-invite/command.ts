import { Command } from "@/core/commands/command";

export type RespondToInviteProps = {
  token: string;
  accountId: string;
  accountEmail: string;
  action: "accept" | "reject";
};

export class RespondToInviteCommand implements Command {
  public constructor(public readonly props: RespondToInviteProps) {}
}
