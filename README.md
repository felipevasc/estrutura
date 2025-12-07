## Threat Weaver

### Logs e comandos

- Cada ferramenta possui um arquivo de configuração persistente em `src/service/nano/services/tools/comandos/<ferramenta>.json`, usado como fonte única para o comando real executado.
- Toda execução grava o log completo em `logs/execucoes/<id>.log`, reutilizado para exibir histórico, fila em execução e pendências.
- Os registros da fila utilizam esses arquivos para manter a exibição consistente entre o comando disparado e a saída retornada.
