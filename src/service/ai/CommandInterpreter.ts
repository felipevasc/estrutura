import prisma from '@/database';
import Database from '@/database/Database';

export class CommandInterpreter {

  async interpret(payload: any, projectId: number) {
      const commandName = payload.COMANDO;

      switch (commandName) {
          case 'AMASS':
              return this.interpretAmass(payload, projectId);
          case 'NMAP':
              return this.interpretNmap(payload, projectId);
          default:
              throw new Error(`Command ${commandName} not supported.`);
      }
  }

  private async interpretAmass(payload: any, projectId: number) {
      const domain = payload.PARAMETRO1;
      if (!domain) throw new Error("Missing domain parameter");

      // Ensure domain exists
      let dbDomain = await prisma.dominio.findFirst({
          where: { endereco: domain, projetoId: projectId }
      });

      if (!dbDomain) {
          // Create it
          await Database.adicionarSubdominio([domain], projectId);
          // Fetch again
          dbDomain = await prisma.dominio.findFirst({
              where: { endereco: domain, projetoId: projectId }
          });
      }

      if (!dbDomain) throw new Error(`Could not find or create domain ${domain}`);

      return {
          command: 'amass',
          args: JSON.stringify({ idDominio: dbDomain.id }),
          projectId
      };
  }

  private async interpretNmap(payload: any, projectId: number) {
      const ipAddr = payload.PARAMETRO1;
      if (!ipAddr) throw new Error("Missing IP parameter");

      // Ensure IP exists
      let dbIp = await prisma.ip.findFirst({
          where: { endereco: ipAddr, projetoId: projectId }
      });

      if (!dbIp) {
          // Create it manually
          dbIp = await prisma.ip.create({
              data: {
                  endereco: ipAddr,
                  projetoId: projectId
              }
          });
      }

      return {
          command: 'nmap',
          args: JSON.stringify({ idIp: dbIp.id }),
          projectId
      };
  }
}

export default new CommandInterpreter();
