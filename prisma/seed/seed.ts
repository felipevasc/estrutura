import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando o seeding...');

    // Cria um projeto
    const projeto = await prisma.projeto.create({
        data: {
            nome: 'Projeto de Teste',
        },
    });
    console.log(`Projeto criado: ${projeto.nome} (ID: ${projeto.id})`);

    // Cria um domínio associado ao projeto
    const dominio = await prisma.dominio.create({
        data: {
            endereco: 'example.com',
            projetoId: projeto.id,
        },
    });
    console.log(`Domínio criado: ${dominio.endereco}`);

    // Cria uma entrada de deface de exemplo
    const deface = await prisma.deface.create({
        data: {
            url: 'http://example.com/hacked.html',
            fonte: 'Google-HackBY',
            dominioId: dominio.id,
        },
    });
    console.log(`Entrada de deface criada para: ${deface.url}`);

    console.log('Seeding concluído.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
