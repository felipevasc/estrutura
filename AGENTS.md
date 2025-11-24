# Guia para Agentes de IA (AGENTS.md)

Este repositório foi arquitetado para ser mantido e expandido por IAs. Siga estas diretrizes estritamente para garantir a integridade, coesão e escalabilidade do sistema.

## Princípios Fundamentais

1.  **Nano-Serviços Independentes:** Cada funcionalidade do backend deve ser um serviço isolado (`NanoService`).
    *   Um serviço **não deve** importar a lógica de outro serviço.
    *   A comunicação é feita **exclusivamente** via `EventBus`.
2.  **Padrões de Código e Arquitetura:**
    *   **Português:** Todas as variáveis, funções, métodos e nomes de arquivos/módulos devem ser em português.
    *   **Sem Comentários:** O código deve ser autoexplicativo. Não adicione comentários nas linhas.
    *   **Concisão:** Escreva o código da menor forma possível.
    *   **Modularidade:** Módulos devem ser totalmente independentes e coesos. A evolução de um não deve depender do conhecimento interno de outro.
3.  **Registro Centralizado:**
    *   Não modifique a lógica do `System.ts` ou do `Explorer/index.tsx`.
    *   Para adicionar um serviço ou visualização, crie o arquivo e adicione-o ao arquivo de registro correspondente (`registry.ts` ou `viewRegistry.tsx`).
3.  **Imutabilidade do Core:** Se você precisa alterar `QueueService`, `TerminalService` ou `System.ts`, pare e pense. É provável que você deva criar um *novo* serviço que interaja com eles via eventos.

## Estrutura do Backend (Nano-Serviços)

### Como criar um novo serviço (Ferramenta)

1.  **Crie o arquivo:** `src/service/nano/services/tools/MinhaFerramentaService.ts`.
2.  **Estenda `NanoService`:** Implemente `initialize()`.
3.  **Escute comandos:**
    ```typescript
    this.listen('COMMAND_RECEIVED', (payload) => {
      if (payload.command === 'minha_ferramenta') {
         // Lógica...
      }
    });
    ```
4.  **Persistência:**
    *   Se precisar ler do banco, importe `prisma` de `@/database`.
    *   Se precisar salvar, use as funções auxiliares de `src/database/Database.ts` ou insira diretamente via `prisma` se for uma tabela específica da ferramenta.
5.  **Registre o serviço:**
    *   Edite `src/service/nano/registry.ts`.
    *   Adicione o `new MinhaFerramentaService()` na lista exportada.

### Eventos Padrão

*   `COMMAND_RECEIVED`: Disparado quando há um job na fila. Payload: `{ command, args, id, projectId }`.
*   `EXECUTE_TERMINAL`: Solicita execução de shell. Payload: `{ command, args, replyTo, errorTo }`.
*   `JOB_COMPLETED`: Notifica sucesso. Payload: `{ id, result }`.
*   `JOB_FAILED`: Notifica erro. Payload: `{ id, error }`.

## Estrutura do Frontend (Visualizações)

O `Explorer` exibe árvores de dados baseadas no contexto (Domínios, Usuários, etc.).

### Como adicionar uma nova visualização

1.  **Crie o Componente:** `src/components/Explorer/arvores/MinhaNovaArvore.tsx`.
2.  **Registre a Visualização:**
    *   Edite `src/config/viewRegistry.tsx`.
    *   Adicione uma entrada ao mapa:
        ```typescript
        'nova_view': <MinhaNovaArvore />
        ```
3.  **Uso:** O estado global `explorer` controla qual chave é exibida.

## Banco de Dados

*   Use `src/database/Database.ts` para operações comuns (adicionar subdomínio, IP, etc.).
*   Evite lógica complexa de banco dentro dos serviços se ela puder ser reutilizada.

## Integração com IA

O projeto agora possui um módulo de IA para auxílio em operações de Red Team.

### Estrutura
*   `src/service/ai/AiService.ts`: Serviço de interação com a OpenAI e recuperação de contexto.
*   `src/service/ai/CommandInterpreter.ts`: Interpretador de comandos sugeridos pela IA para payloads de NanoServices.
*   `src/app/api/v1/chat/`: Endpoints para chat e execução de comandos.
*   `src/components/Chat/`: Interface do usuário (Widget e Drawer).

### Protocolo de Comandos
A IA pode sugerir comandos no formato JSON:
`{"COMANDO":"NOME", "PARAMETRO1":"VALOR"}`

O `CommandInterpreter` converte estes comandos para a estrutura interna dos NanoServices (ex: resolvendo nomes de domínio para IDs).

### Como adicionar novos comandos à IA
1.  Implemente o comando no `src/service/ai/CommandInterpreter.ts`.
2.  Atualize o Prompt do Sistema em `src/service/ai/AiService.ts` para instruir a IA sobre o novo comando.

## Onde encontrar as coisas

*   `src/service/nano/services/`: Serviços Core (Queue, Terminal).
*   `src/service/nano/services/tools/`: Serviços de Ferramentas (Amass, Nmap).
*   `src/service/nano/registry.ts`: **Lista de serviços ativos.**
*   `src/config/viewRegistry.tsx`: **Lista de visualizações ativas.**
