import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const dominio = await prisma.dominio.findFirst();
  if (!dominio) {
      console.log("No domain found, skipping whatweb seed");
      return;
  }

  // Clear existing
  await prisma.whatwebResultado.deleteMany({});

  await prisma.whatwebResultado.create({
    data: {
      assinatura: "HTTPServer|Apache 2.4|" + dominio.id + "||",
      plugin: "HTTPServer",
      valor: "Apache 2.4",
      dados: { string: "Apache 2.4", version: "2.4" },
      dominioId: dominio.id
    }
  });

  await prisma.whatwebResultado.create({
    data: {
      assinatura: "HTTPServer|Ubuntu|" + dominio.id + "||",
      plugin: "HTTPServer",
      valor: "Ubuntu",
      dados: { os: "Ubuntu" },
      dominioId: dominio.id
    }
  });

   await prisma.whatwebResultado.create({
    data: {
      assinatura: "Cookies|PHPSESSID|" + dominio.id + "||",
      plugin: "Cookies",
      valor: "PHPSESSID",
      dados: { string: "PHPSESSID", path: "/" },
      dominioId: dominio.id
    }
  });

  console.log("WhatWeb data seeded");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
