# 📊 BDU Frontend — Next.js Dashboard

O **BDU Frontend** é a interface web interativa do **Banco de Dados Único (BDU)** da Meta Consultoria. Ele consolida informações estratégicas em tempo real para permitir análises transversais de projetos, fluxo do funil comercial, indicadores de desempenho financeiro e o mapeamento dinâmico da estrutura organizacional de membros e células.

---

## 🚀 Tecnologias Utilizadas

- **Framework:** [Next.js 15](https://nextjs.org/) (com App Router e Server/Client Components)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS (com tema customizado da Meta Consultoria)
- **Visualização de Dados:** Recharts (gráficos de pizza, barras e linhas) e renderização direta SVG para fluxos tridimensionais
- **Mapeamento Físico:** Motor de física customizado baseado em forças para simulação interativa de organogramas
- **Iconografia:** Lucide React

---

## 🖥️ Telas do Sistema

### 1. 🔑 Página de Login
- Autenticação de usuários integrada ao servidor backend.
- Segurança reforçada contra múltiplos envios sucessivos e cookies protegidos.

### 2. 🏠 Dashboard Geral (Home)
- Exibição de KPIs agregados da consultoria.
- Lista de projetos ativos e sinalizadores de atraso ou risco de execução.

### 3. 📈 Painel Comercial
- Controle do funil de conversão de leads (Funil 3D customizado em SVG).
- Métricas de faturamento comercial, motivos de perda de contratos e desempenho de canais de captação.

### 4. 💰 Painel Financeiro
- Demonstrativo do fluxo financeiro com faturamento real vs. planejado.
- Indicadores de despesas e lucros distribuídos por categoria.

### 5. 🔍 Análises Cruzadas (Grid de Dimensões)
- Matriz dinâmica que cruza múltiplos dados como Coordenações, Membros, Cargos e Projetos para calcular faturamento acumulado por cruzamento.

### 6. 🕸️ Mapa de Pessoas (Organograma Interativo)
- Renderização visual e dinâmica da hierarquia e células da Meta Consultoria, utilizando simulação física para permitir arrastar e agrupar nós de membros em tempo real.

### 7. 🛠️ Catálogo de Serviços
- Listagem dos serviços ativos oferecidos, facilitando o mapeamento de competências internas.

---

## ⚙️ Configuração Local

### 1. Pré-requisitos
Certifique-se de possuir o Node.js 18+ instalado.

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env.local` na raiz da pasta `frontend/`:
```bash
cp .env.local.example .env.local
```
Edite o `.env.local` configurando a URL da API do backend FastAPI:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ADMIN_TOKEN=seu_token_super_secreto
```

### 4. Executar servidor de desenvolvimento
```bash
npm run dev
```
Abra o navegador em: **[http://localhost:3000](http://localhost:3000)**

---

## 📦 Build e Compilação

Para compilar o projeto para produção e garantir que não há erros de tipagem/TypeScript:
```bash
npm run build
```
Ou execute a checagem rápida de tipos sem gerar a build final:
```bash
npx tsc --noEmit
```
