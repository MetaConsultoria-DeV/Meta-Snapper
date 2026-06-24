/**
 * Estrutura organizacional REAL (SETTA 26.2) — portada de
 * referencia-mvp-html/.../org.js. Exposta como ORG.
 * TEMPORÁRIO: substituída por dados reais (membros/cargos/células) na Phase 5.
 */

/**
 * Represents the hierarchical level/role type of a node in the organization.
 * - director: Executive level leadership.
 * - manager: Mid-level management or head of specific domains.
 * - coord: Operational coordination or analysts.
 * - pmo: Project Management Office representative.
 * - staff: Technical support, operational staff, advisors.
 * - group: A collection of individuals grouped as a single node (e.g. consultants).
 */
export type OrgNodeType = "director" | "manager" | "coord" | "pmo" | "staff" | "group";

/**
 * Represents a node in the organizational tree.
 * Nodes can form recursive structures through the `children` property.
 */
export type OrgNode = {
  /** The hierarchy level of this node. */
  type: OrgNodeType;
  /** The professional title/role name. */
  role: string;
  /** The name of the member occupying this position. Use '—' if vacant. */
  name: string;
  /** Additional detail, description, or specialties of this node. */
  detail?: string;
  /** Child nodes nested under this position. */
  children?: OrgNode[];
};

/**
 * Represents a department cell ("Célula") in the organization.
 * Contains information about the cell's director, description, and internal hierarchy tree.
 */
export type OrgCelula = {
  /** Unique identifier of the cell. */
  id: string;
  /** User-friendly name of the cell. */
  nome: string;
  /** Codename or symbol of the cell mascot. */
  mascot: string;
  /** Hex color code associated with the cell's brand identity. */
  cor: string;
  /** A paragraph describing the cell's goals, focus area, and responsibilities. */
  desc: string;
  /** The director leading this cell. */
  diretor: { role: string; name: string; detail?: string };
  /** The hierarchy tree of nodes nested under the director. */
  tree: OrgNode[];
  /** Count of active individuals in the cell (headcount). */
  headcount: number;
  /** Total number of positions in the cell structure. */
  posicoes: number;
};

/**
 * Flat representation of a position in the organization, flattened from the recursive trees.
 * Ideal for search, filtering, and table layouts.
 */
export type Posicao = {
  /** The ID of the cell containing this position. */
  cel: string;
  /** The name of the cell containing this position. */
  celNome: string;
  /** The brand color of the cell. */
  cor: string;
  /** The mascot symbol of the cell. */
  mascot: string;
  /** The node type/level. */
  tipo: OrgNodeType;
  /** The role title. */
  role: string;
  /** The name of the occupant(s). */
  name: string;
  /** Detail or descriptions. */
  detail: string;
  /** The area/cell name. */
  area: string;
  /** Whether this position represents a group of consultants instead of an individual. */
  isGroup: boolean;
  /** Total headcount of people active in this specific role. */
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

/**
 * Metadata map detailing presentation labels and theme colors for each position level.
 */
export const tipoMeta: Record<OrgNodeType, { label: string; cor: string }> = {
  director: { label: "Diretoria", cor: "#2AD8FF" },
  pmo: { label: "PMO", cor: "#F5A623" },
  manager: { label: "Gerência / Head", cor: "#0067FF" },
  coord: { label: "Coordenação / Analista", cor: "#22C0FF" },
  staff: { label: "Assessoria / Apoio", cor: "#6B7299" },
  group: { label: "Equipe / Consultores", cor: "#9aa3bf" },
};

/**
 * Recursively traverses the OrgNode hierarchy tree, flattening it into the Posicao array.
 * Calculates headcount based on delimiter split ("·") and tracks child-level operational areas.
 *
 * @param {OrgNode} node - The current node to process.
 * @param {Omit<OrgCelula, "headcount" | "posicoes">} cel - The associated cell containing the node.
 * @param {Posicao[]} acc - The accumulator array where flattened positions are pushed.
 * @param {string} area - The inherited or active department/sub-area.
 * @returns {void}
 */
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

/** Flattened list of all organizational positions. */
const posicoes: Posicao[] = [];
celulasRaw.forEach((cel) => {
  posicoes.push({
    cel: cel.id, celNome: cel.nome, cor: cel.cor, mascot: cel.mascot,
    tipo: "director", role: cel.diretor.role, name: cel.diretor.name,
    detail: cel.diretor.detail || "", area: cel.nome, isGroup: false, headcount: 1,
  });
  cel.tree.forEach((n) => walk(n, cel, posicoes, cel.nome));
});

/** Total count of active members within all cells. */
const headcountTotal = posicoes.reduce((s, p) => s + p.headcount, 0);

/** Total count of leaders (directors, managers, coordinators, PMO). */
const lideranca = posicoes.filter(
  (p) => ["director", "manager", "pmo", "coord"].includes(p.tipo) && p.name !== "—",
).length;

/** Total count of coordination-level roles. */
const coordCount = posicoes.filter((p) => p.tipo === "coord" && p.role.includes("·")).length;

/** Enriched cell list containing compiled counts of headcount and positions. */
const celulas: OrgCelula[] = celulasRaw.map((cel) => ({
  ...cel,
  headcount: posicoes.filter((p) => p.cel === cel.id).reduce((s, p) => s + p.headcount, 0),
  posicoes: posicoes.filter((p) => p.cel === cel.id).length,
}));

/**
 * Unified organizational database representing the SETTA organizational structure.
 */
export const ORG = {
  /** Array of cells with calculated headcount and position metrics. */
  celulas,
  /** Flat array of all positions in the organization. */
  posicoes,
  /** Label and color metadata per position type. */
  tipoMeta,
  /** Organizational summary indicators. */
  resumo: {
    celulas: celulas.length,
    headcountTotal,
    lideranca,
    coordCount,
    posicoes: posicoes.length,
  },
};

/** Serializable type shape of the ORG object, ideal for Server to Client props serialization. */
export type Org = typeof ORG;
