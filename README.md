# Arena OBI Colaborativa 🏆

Plataforma Web gamificada e offline-first focada no Ensino de Pensamento Computacional para o Ensino Fundamental. O sistema utiliza a metodologia de *Pair Programming* (Programação em Par) com revezamento de papéis (Piloto e Copiloto) em uma única máquina, ideal para escolas com infraestrutura restrita.

## Arquitetura Base e PWA Offline-First
A fundação do projeto foi estabelecida com foco em performance e tolerância a falhas de rede (Offline-First).

**Tecnologias implementadas:**
* **React + TypeScript (via Vite):** Para uma interface tipada, rápida e modular.
* **Tailwind CSS v4:** Estilização utility-first focada na gamificação da interface.
* **Vite PWA (Workbox):** Configuração de *Service Workers* para cacheamento total (`CacheFirst`) de assets estáticos (HTML, CSS, JS, Imagens e Fontes), garantindo que a aplicação funcione em laboratórios escolares sem acesso à internet após o primeiro carregamento.

**Como executar localmente:**
\`\`\`bash
npm install
npm run dev
\`\`\`