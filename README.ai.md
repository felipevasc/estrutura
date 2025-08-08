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

### Backend

- **Framework:** Next.js (API Routes)
- **Linguagem:** TypeScript
- **API:** As rotas da API estão em `src/app/api/v1/`. Elas são responsáveis por interagir com o banco de dados e o sistema de arquivos.

### Banco de Dados

- **SGBD:** SQLite
- **ORM:** Prisma
- **Schema:** O schema do banco de dados está definido em `prisma/schema.prisma`. Ele é a fonte da verdade para a estrutura de dados.
- **Migrations:** Para atualizar o banco de dados, utilize o comando `npm run updatedb`.

### Processamento de Comandos

- **`src/service/CommandProcessor.ts`:** Este é um serviço singleton responsável por processar a fila de comandos.
- **`src/service/tools/`:** Contém a lógica para executar cada ferramenta de segurança. Cada ferramenta tem seu próprio arquivo que exporta uma função para executá-la e tratar sua saída.

## Padrões de Código e Convenções

- **Idioma:** Nomes de variáveis, métodos, arquivos e diretórios devem ser em **português**.
- **Comentários:** O código **não deve conter comentários**. A clareza do código deve ser suficiente para o seu entendimento.
- **Coesão e Responsabilidade Única:** Crie arquivos curtos e coesos, com uma única responsabilidade clara.
- **Simplicidade:** A forma de implementação deve ser sempre a mais fácil possível para facilitar futuras manutenções.
- **Reaproveitamento:** Sempre que uma função ou lógica for criada, analise se não já existe algo semelhante. Em caso positivo, utilize o que já existe ou refatore para torná-lo genérico.

## Adicionando Novas Ferramentas

Para adicionar uma nova ferramenta ao sistema, siga os seguintes passos:

1.  **Crie o arquivo da ferramenta:**
    - Em `src/service/tools/`, crie um novo arquivo para a sua ferramenta (ex: `src/service/tools/domain/minhaferramenta.ts`).
    - Neste arquivo, crie uma função que executa a ferramenta (usando `child_process` ou similar) e trata a sua saída, retornando um objeto com os dados estruturados.

2.  **Adicione a ferramenta ao `CommandProcessor`:**
    - Abra o arquivo `src/service/CommandProcessor.ts`.
    - Importe a função que você criou no passo 1.
    - Adicione uma nova entrada no objeto `commandServiceMap`, mapeando o nome do comando para a sua função.

3.  **Adicione a ferramenta à interface:**
    - Modifique o componente `src/components/Ferramentas/index.tsx` para exibir a nova ferramenta no painel da direita quando um alvo compatível for selecionado.
    - A ação de clique do botão da ferramenta deve chamar a API para enfileirar o novo comando.

4.  **Crie a rota da API:**
    - Crie uma nova rota na API (`src/app/api/v1/...`) que recebe a requisição do frontend e adiciona o comando correspondente à tabela `Command` no banco de dados com o status `PENDING`. O `CommandProcessor` se encarregará de executá-lo.
