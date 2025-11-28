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
          case 'RUSTSCAN':
              return this.interpretRustscan(payload, projectId);
          case 'GOBUSTER':
              return this.interpretGobuster(payload, projectId);
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

  private async interpretRustscan(payload: any, projectId: number) {
      const ipAddr = payload.PARAMETRO1;
      if (!ipAddr) throw new Error("Missing IP parameter");

      let dbIp = await prisma.ip.findFirst({
          where: { endereco: ipAddr, projetoId: projectId }
      });

      if (!dbIp) {
          dbIp = await prisma.ip.create({
              data: {
                  endereco: ipAddr,
                  projetoId: projectId
              }
          });
      }

      return {
          command: 'rustscan',
          args: JSON.stringify({ idIp: dbIp.id }),
          projectId
      };
  }

  private async interpretGobuster(payload: any, projectId: number) {
      const alvo = payload.PARAMETRO1;
      if (!alvo) throw new Error("Missing target parameter");

      const normalizado = this.normalizarAlvo(alvo);
      let dominio = await prisma.dominio.findFirst({
          where: { endereco: normalizado, projetoId: projectId }
      });

      let ip = null;

      if (!dominio) {
          ip = await prisma.ip.findFirst({
              where: { endereco: normalizado, projetoId: projectId }
          });
      }

      if (!dominio && !ip) {
          if (this.verificarIp(normalizado)) {
              ip = await prisma.ip.create({
                  data: {
                      endereco: normalizado,
                      projetoId: projectId
                  }
              });
          } else {
              await Database.adicionarSubdominio([normalizado], projectId);
              dominio = await prisma.dominio.findFirst({
                  where: { endereco: normalizado, projetoId: projectId }
              });
          }
      }

      if (!dominio && !ip) throw new Error(`Could not find or create target ${normalizado}`);

      const args = dominio ? { idDominio: dominio.id } : { idIp: ip?.id };

      return {
          command: 'gobuster',
          args: JSON.stringify(args),
          projectId
      };
  }

  private normalizarAlvo(alvo: string) {
      try {
          const url = new URL(alvo.startsWith('http') ? alvo : `http://${alvo}`);
          return url.hostname || url.host || alvo;
      } catch {
          return alvo;
      }
  }

  private verificarIp(valor: string) {
      return /^\d+\.\d+\.\d+\.\d+$/.test(valor);
  }
}

export default new CommandInterpreter();
