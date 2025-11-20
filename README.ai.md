# Guia para Desenvolvimento com IA

Este documento serve como um guia para a IA que auxiliará no desenvolvimento e manutenção deste sistema. Ele contém informações sobre a arquitetura, padrões de código e outras diretrizes importantes.

## Visão Geral do Sistema

O sistema é uma ferramenta de auxílio para equipes de Red Team. Ele centraliza as informações coletadas durante um pentest e automatiza a execução de ferramentas de segurança. As principais funcionalidades são:

- **Gerenciamento de Projetos:** Cada avaliação de segurança é um projeto separado.
- **Visualização de Dados:** As informações são organizadas em uma árvore, com diferentes visualizações (por domínio, rede/IP, contas, etc.).
- **Painel de Target:** Ao selecionar um alvo (um nó na árvore), um painel central exibe um resumo das informações coletadas sobre ele.
- **Execução de Ferramentas:** Um painel à direita mostra as ferramentas disponíveis para o alvo selecionado. Clicar em uma ferramenta a executa.
- **Fila de Execução:** Os comandos são executados em uma fila, permitindo o acompanhamento do progresso.
- **Banco de Dados Estruturado:** A saída das ferramentas é tratada e armazenada em um banco de dados SQLite, facilitando a consulta e correlação de informações.

## Arquitetura

O sistema é construído com Next.js e TypeScript.

### Frontend

- **Framework:** Next.js (React)
- **Linguagem:** TypeScript
- **Estilização:** Styled Components e Ant Design.
- **Estrutura:**
    - `src/app/aplicacao`: Contém a página principal da aplicação.
    - `src/components`: Componentes React reutilizáveis e específicos de funcionalidades (Explorer, Ferramentas, Visualizador, etc.).
    - `src/layout`: Componentes que definem a estrutura visual da página (Topo, Rodapé, Menu).
    - `src/store`: Gerenciamento de estado global da aplicação.
    - `src/theme`: Contém todas as definições de design, como cores, fontes e estilos globais.

#### Convenção de Estilo

Toda a estilização da aplicação é centralizada no diretório `src/theme`. Para usar as definições do tema em um styled component, utilize a prop `theme` que é injetada pelo `ThemeProvider`.

**Exemplo:**

```javascript
import styled from 'styled-components';

export const MeuComponenteEstilizado = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
`;
```

### Backend e Nano-Serviços

O backend foi refatorado para seguir uma arquitetura orientada a eventos e "nano-serviços". A ideia central é que a evolução do sistema se dê através da **adição de novos serviços**, e não pela modificação de códigos monolíticos. Cada serviço é uma unidade coesa, independente e responsável por uma tarefa única.

#### Estrutura (`src/service/nano/`)

- **`EventBus.ts`:** O canal de comunicação central. Todos os serviços se comunicam emitindo e escutando eventos aqui.
- **`NanoService.ts`:** A classe base abstrata para todos os serviços. Fornece acesso ao `bus` e métodos de log.
- **`System.ts` (`NanoSystem`):** O orquestrador que inicializa e registra todos os serviços disponíveis.

#### Serviços Principais (`src/service/nano/services/`)

- **`QueueService.ts`:** Monitora a fila de comandos no banco de dados. Quando encontra um comando pendente (`PENDING`), emite um evento `COMMAND_RECEIVED` para que a ferramenta apropriada o execute. Também gerencia timeouts e atualiza o status do comando (`COMPLETED`, `FAILED`).
- **`TerminalService.ts`:** Responsável por executar comandos shell no sistema operacional. Escuta o evento `EXECUTE_TERMINAL` e emite `TERMINAL_RESULT` (ou um evento de resposta customizado) ao finalizar.

#### Serviços de Ferramentas (`src/service/nano/services/tools/`)

Cada ferramenta (Amass, Nmap, etc.) é um nano-serviço separado.

- **Responsabilidade:**
  1.  Escutar o evento `COMMAND_RECEIVED`.
  2.  Verificar se o comando é para ela (ex: `if (payload.command === 'amass')`).
  3.  Preparar os argumentos e emitir `EXECUTE_TERMINAL` para rodar o binário.
  4.  Escutar a resposta do terminal, processar a saída (fazer parse do texto).
  5.  Salvar os resultados no banco de dados.
  6.  Emitir `JOB_COMPLETED` (ou `JOB_FAILED`) para notificar o `QueueService`.

### Banco de Dados

- **SGBD:** SQLite
- **ORM:** Prisma
- **Schema:** O schema do banco de dados está definido em `prisma/schema.prisma`. Ele é a fonte da verdade para a estrutura de dados.
- **Migrations:** Para atualizar o banco de dados, utilize o comando `npm run updatedb`.

## Padrões de Código e Convenções

- **Idioma:** Nomes de variáveis, métodos, arquivos e diretórios devem ser em **português** (exceto termos técnicos padronizados ou nomes de ferramentas).
- **Arquitetura Evolutiva:** A evolução do backend deve ocorrer via **incremento de serviços**. Evite alterar a lógica central do `QueueService` ou `TerminalService` a menos que seja uma melhoria estrutural. Para novas funcionalidades, crie novos serviços.
- **Comentários:** O código deve ser autoexplicativo.
- **Coesão:** Cada serviço deve fazer uma coisa apenas.

## Adicionando Novas Ferramentas

Para adicionar uma nova ferramenta ao sistema, siga o fluxo dos Nano-Serviços:

1.  **Crie o Nano-Serviço da Ferramenta:**
    - Crie um arquivo em `src/service/nano/services/tools/` (ex: `MinhaFerramentaService.ts`).
    - Estenda a classe `NanoService`.
    - No método `initialize()`, registre um listener para `COMMAND_RECEIVED`.
    - Implemente a lógica:
        - Verifique se o comando é o seu.
        - Busque dados necessários no DB (ex: domínio, IP).
        - Emita `EXECUTE_TERMINAL` definindo `replyTo` e `errorTo` para eventos únicos (ex: `MINHAFERRAMENTA_RESULT`).
        - Escute esses eventos de resposta para processar o output e salvar no banco.
        - Emita `JOB_COMPLETED` ao final.

2.  **Registre no Sistema:**
    - Abra `src/service/nano/System.ts`.
    - Importe seu novo serviço.
    - Adicione `this.services.push(new MinhaFerramentaService());` no método `initialize`.

3.  **Adicione a ferramenta à interface (Frontend):**
    - Modifique `src/components/Ferramentas/index.tsx` para exibir o botão da ferramenta.
    - A ação do botão deve chamar a API `/api/v1/queue/add` enviando o nome do comando (igual ao que seu serviço espera).

4.  **Verificação:**
    - O sistema cuidará do resto: a API adiciona na fila, o `QueueService` pega, avisa seu serviço, seu serviço roda o terminal, processa e avisa que acabou.

## Outras observações
- **Novo target:** Sempre que incluir um novo target, se atentar para incluir também no explorer e criar uma visualização das informações dele. Também se atentar para fazer o carregamento deste target a partir da consulta de origem, apenas incrementando com `include` na chamada do prisma o novo target. Fazer isso sempre pra o mínimo de 4 níveis possíveis onde aquele target pode aparecer, conforme feito no arquivo `src/app/api/v1/projetos/[id]/dominios/route.ts`.
