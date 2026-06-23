/**
 * Estrutura organizacional REAL (SETTA 26.2) — portada de
 * referencia-mvp-html/.../org.js. Exposta como ORG.
 * TEMPORÁRIO: substituída por dados reais (membros/cargos/células) na Phase 5.
 */

export type OrgNodeType = "director" | "manager" | "coord" | "pmo" | "staff" | "group";

export type OrgNode = {
  type: OrgNodeType;
  role: string;
  name: string;
  detail?: string;
  children?: OrgNode[];
};

export type OrgCelula = {
  id: string;
  nome: string;
  mascot: string;
  cor: string;
  desc: string;
  diretor: { role: string; name: string; detail?: string };
  tree: OrgNode[];
  headcount: number;
  posicoes: number;
};

export type Posicao = {
  cel: string;
  celNome: string;
  cor: string;
  mascot: string;
  tipo: OrgNodeType;
  role: string;
  name: string;
  detail: string;
  area: string;
  isGroup: boolean;
  headcount: number;
};

const celulasRaw: Omit<OrgCelula, "headcount" | "posicoes">[] = [
  {
    id: "presidencia", nome: "Presidência", mascot: "eagle", cor: "#2AD8FF",
    desc: "Estratégia institucional, relacionamentos externos, eventos e posicionamento de mercado da Meta Consultoria.",
    diretor: { role: "Diretora Presidente", name: "Marina Ferreira da Costa" },
    tree: [
      { type: "manager", role: "Head de Parcerias", name: "—", children: [
        { type: "staff", role: "Equipe", name: "Equipe de Parcerias", detail: "Interação · Prospecção" },
      ] },
      { type: "manager", role: "Head de Conteúdo", name: "—", children: [
        { type: "staff", role: "Equipe", name: "Equipe de Conteúdo", detail: "Identidade visual · Posts" },
      ] },
      { type: "manager", role: "Head de Logística", name: "—", children: [
        { type: "staff", role: "Equipe", name: "Equipe de Logística" },
        { type: "staff", role: "Apoio", name: "Staff" },
      ] },
      { type: "manager", role: "Gerente de Relacionamentos", name: "—", children: [
        { type: "staff", role: "Articuladora", name: "Engajamento", detail: "Alumni · Eventos · Atléticas" },
        { type: "staff", role: "Articuladora", name: "Posicionamento", detail: "Empresas · CRM · Parcerias" },
      ] },
    ],
  },
  {
    id: "projetos", nome: "Projetos", mascot: "skull", cor: "#0067FF",
    desc: "Consultoria empresarial com foco em Engenharia, Gestão de Negócios e Tecnologia.",
    diretor: { role: "Diretora de Projetos", name: "Lucianna Poncione" },
    tree: [
      { type: "pmo", role: "PMO — Escritório de Projetos", name: "Julia Dib", detail: "Metodologias · Indicadores · Gerentes" },
      { type: "manager", role: "Gerente de Inovação", name: "Leonardo Cypriano", detail: "I9 · Projetos Internos · Academia", children: [
        { type: "coord", role: "Analistas de Inovação", name: "Lucas · Aloysio · Iago", detail: "Pedro José · Pedro H. · Naylan", children: [
          { type: "staff", role: "Iniciativa", name: "Academia de Inovação", detail: "Ciclos quinzenais · 26 impactados" },
        ] },
      ] },
      { type: "manager", role: "Gerentes de Projetos", name: "Luana · Carolina · Letícia", detail: "Beatriz · Diana · atuação transversal" },
      { type: "coord", role: "Coordenadora · CE", name: "Paula Monteiro", detail: "Construção e Energia", children: [
        { type: "group", role: "Consultores CE", name: "Anallu · Gabriel · Maria Luiza · Anthony · João V. · Marco · Ana Lole · Renan Valle" },
      ] },
      { type: "coord", role: "Coordenadora · DM", name: "Victória Brandão", detail: "Desenvolvimento de Máquinas", children: [
        { type: "group", role: "Consultores DM", name: "Cauã · João P. Caruso · Felipe Souto · Sávio · Daniel · Marcos V. · Leo Guedes · Reinaldo" },
      ] },
      { type: "coord", role: "Coordenador · GN", name: "Pedro Henrique", detail: "Gestão de Negócios", children: [
        { type: "group", role: "Consultores GN", name: "João Pedro · Ana Clara Regal · Gabriela Samary · Letícia Queiroz" },
      ] },
      { type: "coord", role: "Coordenadora · OP", name: "Julia Nunes", detail: "Otimização de Processos", children: [
        { type: "group", role: "Consultores OP", name: "Ana Clara · Anallu · João G. Cabral · Lucas Vaz" },
      ] },
      { type: "coord", role: "Coordenador · TD", name: "Yan Souto", detail: "Tecnologia e Desenvolvimento", children: [
        { type: "group", role: "Consultores TD", name: "Filipe Pinto · Nicholas · Felipe Cabral · Camille Sá · João Pedro" },
      ] },
    ],
  },
  {
    id: "operacoes", nome: "Operações", mascot: "owl", cor: "#00B894",
    desc: "Gestão de recursos patrimoniais, financeiros e tecnológicos. Fase atual: retomada e crescimento + BDU.",
    diretor: { role: "Diretora de Operações", name: "Luísa Ruch Werneck Fonseca", detail: "MetaFogo · Espaço físico e digital" },
    tree: [
      { type: "manager", role: "Gerente de Operações", name: "Ana Luísa Aquino", detail: "Eng. Produção", children: [
        { type: "coord", role: "Analista de Operações", name: "Davi Moreno", detail: "Ferramentas · BDU", children: [
          { type: "group", role: "Equipe de TI", name: "Davi · Anna Clara · Felipe Cabral · Filipe Pinto · Nicholas · Paula Monteiro · Ana Lole · Mateus Tito" },
        ] },
      ] },
      { type: "manager", role: "Gerente Financeiro", name: "Bernardo Chavão", detail: "Notas Fiscais · Eng. Produção", children: [
        { type: "staff", role: "Assessora Financeira", name: "Antônia Peçanha", detail: "Contratos · Cobranças · Pipefy" },
        { type: "staff", role: "Assessora Financeira", name: "Juliana Rodrigues", detail: "Controle contábil · PIX" },
      ] },
    ],
  },
  {
    id: "mv", nome: "Marketing & Vendas", mascot: "chameleon", cor: "#7C4DFF",
    desc: "Geração de demanda, posicionamento de marca e execução comercial. Melhor Célula — SETTA 26.2.",
    diretor: { role: "Diretora de Marketing & Vendas", name: "Giovana Drummond" },
    tree: [
      { type: "manager", role: "Gerente de Marca", name: "Gustavo Ferreira", detail: "Calendário de Conteúdo", children: [
        { type: "staff", role: "Analista de Marca", name: "Carol Alves", detail: "SEO · Redes Sociais" },
        { type: "group", role: "Departamento Criativo ✦ transversal", name: "Giovana A. · Bernardo · Pedro H. · Vinícius · Carol B. · Beatriz · Iago · Juliana · Sávio · Lucas Vaz" },
      ] },
      { type: "manager", role: "Gerente de Marketing", name: "Luíza Botelho", detail: "Mídia Paga · E-mail Mkt", children: [
        { type: "staff", role: "Analista de Marketing", name: "Maria Eduarda Gomes", detail: "Google Ads · Testes A/B" },
        { type: "staff", role: "Analista de BI", name: "Anna Clara Pimentel", detail: "Relatórios · Dashboards" },
      ] },
      { type: "manager", role: "Gerente da Área Comercial", name: "Vinícius Luzo", detail: "Sales Pipeline · Pipefy", children: [
        { type: "group", role: "Negociadores — AC", name: "Marcelo Benevides · Gustavo Alvim · Breno Lourival · Bernardo Queiroz" },
      ] },
    ],
  },
  {
    id: "gp", nome: "Gestão de Pessoas", mascot: "wolf", cor: "#F5A623",
    desc: "Processo Seletivo (SETTA), cultura organizacional, performance, dados de membros e Diversidade & Inclusão.",
    diretor: { role: "Diretor de Gestão de Pessoas", name: "Bryan Vidal", detail: "Tripé Clima & Cultura" },
    tree: [
      { type: "manager", role: "Gerentes SETTA", name: "Denise Mendes", detail: "Luis Filipe · Henrique Trope", children: [
        { type: "coord", role: "Analistas SETTA", name: "Samuel · Felipe Moreira", children: [
          { type: "group", role: "Equipe SETTA + SPD", name: "Entrevistas · Dinâmica em grupo · Mentores · BigBrothers · Feedbacks" },
        ] },
      ] },
      { type: "manager", role: "Gerente de Gestão de Pessoas", name: "Heitor Matheus", detail: "Coord. D&I · MetaStore · Eventos", children: [
        { type: "staff", role: "Analistas de Cultura e Performance", name: "Carolina Bragança · Sofia Ganim" },
        { type: "staff", role: "Analista de Dados", name: "Mateus Titoneli", detail: "Power BI · Power Automate" },
      ] },
      { type: "coord", role: "Coordenação de D&I", name: "Heitor Matheus", detail: "Diversidade & Inclusão · SE LIGA", children: [
        { type: "group", role: "Liga D&I", name: "Membros voluntários de diversas células" },
      ] },
    ],
  },
];

export const tipoMeta: Record<OrgNodeType, { label: string; cor: string }> = {
  director: { label: "Diretoria", cor: "#2AD8FF" },
  pmo: { label: "PMO", cor: "#F5A623" },
  manager: { label: "Gerência / Head", cor: "#0067FF" },
  coord: { label: "Coordenação / Analista", cor: "#22C0FF" },
  staff: { label: "Assessoria / Apoio", cor: "#6B7299" },
  group: { label: "Equipe / Consultores", cor: "#9aa3bf" },
};

function walk(node: OrgNode, cel: Omit<OrgCelula, "headcount" | "posicoes">, acc: Posicao[], area: string) {
  const isNamed = node.name && node.name !== "—";
  acc.push({
    cel: cel.id, celNome: cel.nome, cor: cel.cor, mascot: cel.mascot,
    tipo: node.type, role: node.role, name: node.name, detail: node.detail || "",
    area, isGroup: node.type === "group",
    headcount: isNamed ? node.name.split("·").length : 0,
  });
  const childArea = node.type === "coord" && node.role.includes("·") ? node.role.split("·")[1].trim() : area;
  (node.children || []).forEach((c) => walk(c, cel, acc, childArea));
}

const posicoes: Posicao[] = [];
celulasRaw.forEach((cel) => {
  posicoes.push({
    cel: cel.id, celNome: cel.nome, cor: cel.cor, mascot: cel.mascot,
    tipo: "director", role: cel.diretor.role, name: cel.diretor.name,
    detail: cel.diretor.detail || "", area: cel.nome, isGroup: false, headcount: 1,
  });
  cel.tree.forEach((n) => walk(n, cel, posicoes, cel.nome));
});

const headcountTotal = posicoes.reduce((s, p) => s + p.headcount, 0);
const lideranca = posicoes.filter(
  (p) => ["director", "manager", "pmo", "coord"].includes(p.tipo) && p.name !== "—",
).length;
const coordCount = posicoes.filter((p) => p.tipo === "coord" && p.role.includes("·")).length;

const celulas: OrgCelula[] = celulasRaw.map((cel) => ({
  ...cel,
  headcount: posicoes.filter((p) => p.cel === cel.id).reduce((s, p) => s + p.headcount, 0),
  posicoes: posicoes.filter((p) => p.cel === cel.id).length,
}));

export const ORG = {
  celulas,
  posicoes,
  tipoMeta,
  resumo: {
    celulas: celulas.length,
    headcountTotal,
    lideranca,
    coordCount,
    posicoes: posicoes.length,
  },
};

/** Shape serializável do ORG, para passar de Server → Client Component. */
export type Org = typeof ORG;
