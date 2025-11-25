import { NanoService } from '../NanoService';
import prisma from '@/database';
import { CommandStatus } from '@prisma/client';
import { NanoEvents } from '../events';

export class QueueService extends NanoService {
  private isProcessing = false;
  private currentCommandId: number | null = null;
  private timeoutTimer: NodeJS.Timeout | null = null;
  private readonly JOB_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes timeout

  constructor() {
    super('QueueService');
  }

  initialize(): void {
    this.recoverQueue();
    this.listen(NanoEvents.KICK_QUEUE, () => this.processQueue());
    this.listen(NanoEvents.JOB_COMPLETED, (payload: any) => this.handleJobCompleted(payload));
    this.listen(NanoEvents.JOB_FAILED, (payload: any) => this.handleJobFailed(payload));
  }

  /**
   * Recovers any jobs that were stuck in RUNNING state when the system started.
   * This happens if the server crashed or was restarted during execution.
   */
  private async recoverQueue() {
    this.log('Recovering queue...');
    try {
        const stuckCommands = await prisma.command.findMany({
            where: { status: CommandStatus.RUNNING },
        });

        for (const cmd of stuckCommands) {
            this.log(`Marking stuck command ${cmd.id} as FAILED`);
            await prisma.command.update({
                where: { id: cmd.id },
                data: {
                    status: CommandStatus.FAILED,
                    completedAt: new Date(),
                    output: 'System restarted during execution',
                },
            });
        }
    } catch (e) {
        this.error('Error recovering queue', e);
    }
  }

  private async processQueue() {
    if (this.isProcessing) {
        return;
    }
    this.isProcessing = true;

    try {
        const command = await prisma.command.findFirst({
            where: { status: CommandStatus.PENDING },
            orderBy: { createdAt: 'asc' },
        });

        if (command) {
            this.log(`Found pending command: ${command.command} (ID: ${command.id})`);

            this.currentCommandId = command.id;

            await prisma.command.update({
                where: { id: command.id },
                data: { status: CommandStatus.RUNNING, startedAt: new Date() },
            });

            let args;
            try {
                args = JSON.parse(command.args);
            } catch (jsonError) {
                const errorMessage = jsonError instanceof Error ? jsonError.message : 'Invalid JSON args';
                await this.failCommand(command.id, `Error parsing args: ${errorMessage}`);
                return; // failCommand resets processing
            }

            // Set timeout watchdog
            this.timeoutTimer = setTimeout(() => {
                if (this.currentCommandId === command.id) {
                    this.failCommand(command.id, 'Job timed out (no response from tool service)');
                }
            }, this.JOB_TIMEOUT_MS);

            // Emit event for tools to pick up
            this.bus.emit(NanoEvents.COMMAND_RECEIVED, {
                id: command.id,
                command: command.command,
                args: args,
                projectId: command.projectId
            });

        } else {
            this.isProcessing = false;
        }
    } catch (e) {
        this.error('Error processing queue', e);
        this.isProcessing = false;
    }
  }

  private async handleJobCompleted(payload: any) {
      const { id, result, executedCommand, rawOutput } = payload;

      if (this.currentCommandId !== id) {
          // Received completion for a job we are not currently tracking (maybe from before restart or timeout)
          return;
      }

      this.clearTimeout();
      this.log(`Job completed: ${id}`);

      try {
          await prisma.command.update({
              where: { id: id },
              data: {
                  status: CommandStatus.COMPLETED,
                  completedAt: new Date(),
                  output: JSON.stringify(result, null, 2),
                  rawOutput: rawOutput,
                  executedCommand: executedCommand,
              },
          });
      } catch (e) {
          this.error(`Error updating command status for ${id}`, e);
      }

      this.resetProcessing();
      // Trigger next
      this.processQueue();
  }

  private async handleJobFailed(payload: any) {
      const { id, error } = payload;

      if (this.currentCommandId !== id) {
          return;
      }

      this.clearTimeout();
      this.error(`Job failed: ${id}`, error);

      await this.failCommand(id, error);
  }

  private async failCommand(commandId: number, error: string) {
      try {
          await prisma.command.update({
              where: { id: commandId },
              data: {
                  status: CommandStatus.FAILED,
                  completedAt: new Date(),
                  output: typeof error === 'string' ? error : JSON.stringify(error),
              },
          });
      } catch (e) {
          this.error(`Error updating command status for ${commandId}`, e);
      }

      this.resetProcessing();
      this.processQueue();
  }

  private clearTimeout() {
      if (this.timeoutTimer) {
          clearTimeout(this.timeoutTimer);
          this.timeoutTimer = null;
      }
  }

  private resetProcessing() {
      this.isProcessing = false;
      this.currentCommandId = null;
      this.clearTimeout();
  }
}
