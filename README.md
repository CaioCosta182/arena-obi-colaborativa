# Arena OBI Colaborativa 🏆

Plataforma Web gamificada e offline-first focada no Ensino de Pensamento Computacional para o Ensino Fundamental. O sistema utiliza a metodologia de *Pair Programming* (Programação em Par) com revezamento de papéis (Piloto e Copiloto) em uma única máquina, ideal para escolas com infraestrutura restrita.

## Arquitetura Base e PWA Offline-First
A fundação do projeto foi estabelecida com foco em performance e tolerância a falhas de rede (Offline-First).

**Tecnologias implementadas:**
* **React + TypeScript (via Vite):** Para uma interface tipada, rápida e modular.
* **Tailwind CSS v4:** Estilização utility-first focada na gamificação da interface.
* **Vite PWA (Workbox):** Configuração de *Service Workers* para cacheamento total (`CacheFirst`) de assets estáticos (HTML, CSS, JS, Imagens e Fontes), garantindo que a aplicação funcione em laboratórios escolares sem acesso à internet após o primeiro carregamento.

## Motor de Código e Interface Visual
Integração do motor de abstração lógica que permite às crianças programarem sem precisarem digitar código textual.

**Implementações:**
* Instalação e configuração do **Google Blockly**.
* Criação do componente isolado `BlocklyWorkspace.tsx` para gerenciar o ciclo de vida da interface de blocos no React via `useRef`.
* Tradução do ambiente (Toolbox e Blocos) para Português do Brasil (`pt-br`).
* Implementação do *Listener* assíncrono que captura a árvore de blocos montada e a converte simultaneamente para uma *string* de JavaScript estruturado.

### Customização de Blocos (Padrão OBI)
Para alinhar a plataforma ao nível de Iniciação da Olimpíada Brasileira de Informática (OBI), o motor do Blockly foi estendido com blocos lógicos customizados.
* **Ações Gamificadas:** Criação de blocos focados em estado e movimentação (`obi_mover`, `obi_se_parede`, `obi_cor`), reduzindo a carga cognitiva para alunos do Ensino Fundamental.
* **Code Generators:** Implementação de geradores em tempo real que traduzem as instruções visuais da criança para código JavaScript válido, preparando o terreno para a avaliação automática (Auto-Judge).

### 🖥️ Lobby Interativo e Resolução de Conflitos
* **Interface de Entrada:** Implementação de um Lobby (App.tsx) com cartões gamificados para seleção dos Níveis da OBI. 
* **State Management:** A transição do estado do *Lobby* para a *Arena* ocorre através do roteamento condicional local no React, enviando as propriedades (Props) da questão sorteada.
* **Correção de Árvore DOM:** Remoção do `React.StrictMode` em ambiente de desenvolvimento para evitar a dupla renderização da interface, que causava perda de referência e *bugs* no recurso de drag-and-drop interno da *Toolbox* de mutação do Blockly (como o bloco condicional Se/Senão).

**Como executar localmente:**
\`\`\`bash
npm install

npm run dev
\`\`\`