import prisma from "@/database";
import EventBus from "./EventBus";
import { NanoEvents } from "./events";
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
  EventBus.emit(NanoEvents.KICK_QUEUE);
  return cmd;
}
