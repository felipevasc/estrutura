import prisma from "@/database";
import EventBus from "./EventBus";
import { NanoEvents } from "./events";

export async function queueCommand(commandName: string, args: any, projectId: number) {
  const cmd = await prisma.command.create({
    data: {
      command: commandName,
      args: JSON.stringify(args),
      projectId: projectId,
      status: "PENDING"
    }
  });

  EventBus.emit(NanoEvents.KICK_QUEUE);
  return cmd;
}
