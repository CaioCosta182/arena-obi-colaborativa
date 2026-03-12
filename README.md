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

### 📊 Coleta de Métricas Offline (QR Code)
Como a plataforma é projetada para ambientes sem acesso à rede, a submissão de notas tradicionais (via API) não é viável. A solução implementada foi a criptografia das métricas de uso em um **QR Code dinâmico**.

* **Métricas Extraídas:** Tempo total de resolução, número de submissões incorretas (WA), e identificação dos pilotos.

* **Coleta Passiva:** Ao fim da maratona, a plataforma exibe o código na tela. O professor utiliza a câmera de seu celular para coletar as informações consolidadas da máquina em segundos, garantindo a anotação das notas para a disciplina sem depender de Wi-Fi no laboratório.

### 🎈 Gamificação e Recompensa Visual (Padrão ICPC/SBC)

Para aumentar o engajamento dos alunos do Ensino Fundamental, a Arena OBI incorpora elementos visuais das maratonas universitárias de programação (ICPC / Maratona SBC).

* **Feedback Imediato:** A cada desafio concluído com sucesso, a dupla recebe um "balão" flutuante animado no topo da interface.

* **Senso de Progresso:** A acumulação de balões atua como um marcador visual de progresso e conquista, estimulando a continuidade no fluxo do jogo (Game Loop) sem a necessidade de um placar numérico tradicional.

### 🔒 Área Restrita e Gerenciamento Descentralizado
Para viabilizar a adição de novas questões oficiais ao banco de dados sem exigir recompilação do código, foi implementada uma rota administrativa.

* **Segurança:** Acesso protegido por credenciais hardcoded, garantindo que alunos não manipulem os cenários de prova durante a maratona.

* **Arquitetura Híbrida (Pendrive Virtual):** O Painel do Professor permite exportar e importar o arquivo do banco de dados (JSON) fisicamente via upload para atualização de máquinas sem rede (LAN-less), ou sincronizar via requisição `fetch` de um repositório centralizado caso haja conectividade (WAN).

### 🔬 Coleta de Dados para Pesquisa CSCL
A ferramenta atua como um instrumento de pesquisa acadêmica, capturando métricas granulares do comportamento dos alunos em pares (Pair Programming) e compactando-as no payload do QR Code:

* **Complexidade (Block Count):** Quantidade de blocos lógicos instanciados, permitindo avaliar a elegância e eficiência da solução (ex: força bruta vs. modularização).

* **Tentativas de Execução:** Diferencia perfis de programação por tentativa-e-erro (altos testes) de perfis analíticos.

* **Sobrecarga Cognitiva (Swaps by Time):** Contabiliza estouros do cronômetro de revezamento, mapeando quais lógicas exigiram maior tempo de debate colaborativo.

* **Métricas Clássicas:** Tempo total, erros de submissão (WA) e completude do nível.

**Como executar localmente:**
\`\`\`bash

npm install

npm run dev

\`\`\`