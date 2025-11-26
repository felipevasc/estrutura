import prisma from "@/database";
import NanoSystem from "./System";

export async function queueCommand(commandName: string, args: any, projectId: number) {
  const cmd = await prisma.command.create({
    data: {
      command: commandName,
      args: JSON.stringify(args),
      projectId: projectId,
      status: "PENDING"
    }
  });

  NanoSystem.process();
  return cmd;
}
