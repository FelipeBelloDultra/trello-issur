import { Command } from "@/core/commands/command";

export class UpdateWorkspaceAvatarCommand implements Command {
  public constructor(
    public readonly props: {
      workspaceId: string;
      buffer: Buffer;
      mimeType: string;
      originalName: string;
    },
  ) {}
}
