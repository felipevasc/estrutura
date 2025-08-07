import prisma from '@/database';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

type WebScreenshotExecutionResult = {
  executedCommand: string;
  rawOutput: string;
  treatedResult: any;
};

export const executarWebScreenshot = async (idIp: number): Promise<WebScreenshotExecutionResult> => {
  const ip = await prisma.ip.findUnique({
    where: { id: idIp },
    include: { portas: true, projeto: true },
  });

  if (!ip) {
    throw new Error('IP não encontrado.');
  }

  const webPorts = ip.portas.filter(p => ['http', 'https', 'http-proxy'].includes(p.servico || ''));

  if (webPorts.length === 0) {
    console.log(`[Serviço WebScreenshot] Nenhum serviço web encontrado para ${ip.endereco}`);
    return {
      executedCommand: '',
      rawOutput: 'Nenhuma porta web encontrada.',
      treatedResult: {
        screenshots: [],
      },
    };
  }

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const screenshots = [];
  let fullRawOutput = '';

  const screenshotDir = path.join(process.cwd(), 'public', 'screenshots', `${ip.projeto.id}`, `${ip.id}`);
  fs.mkdirSync(screenshotDir, { recursive: true });

  for (const port of webPorts) {
    const protocol = (port.servico || '').includes('https') ? 'https' : 'http';
    const url = `${protocol}://${ip.endereco}:${port.numero}`;
    const page = await browser.newPage();
    const screenshotPath = path.join(screenshotDir, `screenshot_${port.numero}.png`);
    const publicPath = path.join('/screenshots', `${ip.projeto.id}`, `${ip.id}`, `screenshot_${port.numero}.png`);

    try {
      console.log(`[Serviço WebScreenshot] Tirando screenshot de ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      await page.screenshot({ path: screenshotPath, fullPage: true });

      const webScreenshot = await prisma.webScreenshot.create({
        data: {
          ipId: ip.id,
          port: port.numero,
          path: publicPath,
        },
      });
      screenshots.push({ url, path: publicPath, screenshotId: webScreenshot.id });
      fullRawOutput += `Screenshot de ${url} salvo em ${publicPath}\n`;
    } catch (e: any) {
      console.error(`[Serviço WebScreenshot] Erro ao tirar screenshot de ${url}: ${e.message}`);
      fullRawOutput += `Erro ao tirar screenshot de ${url}: ${e.message}\n`;
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log(`[Serviço WebScreenshot] Screenshots para ${ip.endereco} concluídos.`);

  return {
    executedCommand: `puppeteer em ${webPorts.length} porta(s)`,
    rawOutput: fullRawOutput,
    treatedResult: {
      screenshots,
    },
  };
};
