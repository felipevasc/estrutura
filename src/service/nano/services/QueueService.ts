import { NanoService } from '../NanoService';
import prisma from '@/database';
import { CommandStatus } from '@prisma/client';

export class QueueService extends NanoService {
  private isProcessing = false;
  private currentCommandId: number | null = null;
  private timeoutTimer: NodeJS.Timeout | null = null;
  private readonly JOB_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes timeout

  initialize(): void {
    this.bus.on('KICK_QUEUE', () => this.processQueue());
    this.bus.on('JOB_COMPLETED', (payload) => this.handleJobCompleted(payload));
    this.bus.on('JOB_FAILED', (payload) => this.handleJobFailed(payload));
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
            this.bus.emit('COMMAND_RECEIVED', {
                commandId: command.id,
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
      const { commandId, result, executedCommand, rawOutput } = payload;

      if (this.currentCommandId !== commandId) {
          // Received completion for a job we are not currently tracking (maybe from before restart or timeout)
          return;
      }

      this.clearTimeout();
      this.log(`Job completed: ${commandId}`);

      try {
          await prisma.command.update({
              where: { id: commandId },
              data: {
                  status: CommandStatus.COMPLETED,
                  completedAt: new Date(),
                  output: JSON.stringify(result, null, 2),
                  rawOutput: rawOutput,
                  executedCommand: executedCommand,
              },
          });
      } catch (e) {
          this.error(`Error updating command status for ${commandId}`, e);
      }

      this.resetProcessing();
      // Trigger next
      this.processQueue();
  }

  private async handleJobFailed(payload: any) {
      const { commandId, error } = payload;

      if (this.currentCommandId !== commandId) {
          return;
      }

      this.clearTimeout();
      this.error(`Job failed: ${commandId}`, error);

      await this.failCommand(commandId, error);
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
