/**
 * Dataset de exemplo do BDU — portado de referencia-mvp-html/.../data.js.
 * Interligado: membro → cargo → célula → coordenação → projeto → cliente
 * → oportunidade → contrato → parcela → transação.
 *
 * TEMPORÁRIO (Phase 2/3): substituído por dados reais da API FastAPI na Phase 5.
 */

/**
 * Formats a numeric value into a Brazilian Real currency string.
 *
 * @param {number} n - The raw numeric amount.
 * @returns {string} The formatted BRL currency string (e.g. "R$ 15.000").
 */
export const BRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

/** Represents a Coordination Area within the enterprise. */
export type Coordenacao = {
  /** Unique ID (e.g., 'C-A'). */
  id: string;
  /** Designation name of the coordination division. */
  nome: string;
  /** Primary focus theme/specialty. */
  tema: string;
  /** Associated visual hex color code. */
  cor: string;
};

/** Represents an organizational Cell with members. */
export type Celula = {
  /** Unique cell ID (e.g., 'CEL-1'). */
  id: string;
  /** Cell name designation. */
  nome: string;
  /** Cumulative count of members allocated to this cell. */
  membros: number;
};

/** Represents a career hierarchy title. */
export type Cargo = {
  /** Cargo identifier. */
  id: string;
  /** Title label. */
  nome: string;
  /** Career index level (e.g., 1 for Directors, 6 for Trainees). */
  nivel: number;
};

/** Represents a commercial catalog service item. */
export type Servico = {
  /** Catalog service ID. */
  id: string;
  /** Service designation name. */
  nome: string;
  /** Direct coordinator owner ID. */
  coord: string;
  /** Cumulative projects delivered for this service. */
  projetos: number;
  /** Active opportunities in the sales pipeline for this service. */
  opp: number;
};

/** Represents an registered client organization. */
export type Cliente = {
  /** Client registry ID. */
  id: string;
  /** Company/organization name. */
  nome: string;
  /** Market segment category. */
  segmento: string;
  /** Calendar year when the partnership started. */
  desde: number;
  /** Count of signed projects. */
  projetos: number;
  /** Total value sum of contracts. */
  receita: number;
};

/** Represents an active member of the company. */
export type Membro = {
  /** Unique member ID. */
  id: string;
  /** First and last name. */
  nome: string;
  /** Associated cargo type ID. */
  cargo: string;
  /** Title of the role. */
  cargoNome: string;
  /** Target cell department ID. */
  celula: string;
  /** Associated coordination level ID. */
  coord: string;
  /** List of project IDs this member is allocated to. */
  projetos: string[];
  /** Whether the member works transversal projects across multiple cells. */
  transversal: boolean;
  /** Active allocation state. */
  ativo: boolean;
  /** Year of enrollment. */
  entrada: string;
};

/** Represents a tracked project delivery. */
export type Projeto = {
  /** Unique project code. */
  id: string;
  /** Project naming. */
  nome: string;
  /** Raw status tag ('ativo', 'concluido', 'risco', 'pausado'). */
  status: string;
  /** User-facing display status description. */
  statusLabel: string;
  /** Style/color class associated with status. */
  statusCls: string;
  /** Owner coordination area ID. */
  coord: string;
  /** Client registry ID. */
  cliente: string;
  /** Financial contract value. */
  valor: number;
  /** Delivery completion percentage (0 - 100). */
  progresso: number;
  /** Allocated member IDs. */
  equipe: string[];
  /** Associated catalog services IDs. */
  servicos: string[];
  /** Whether this project is linked to a signed contract. */
  temContrato: boolean;
  /** Number of monitoring touchpoints completed. */
  acompanhamentos: number;
  /** Project launch month. */
  inicio: string;
  /** Target deadline month. */
  prazo: string;
  /** Health status evaluation ('ok' or 'atencao'). */
  saude: string;
};

/** Sales funnel stage representation. */
export type Fase = {
  /** Funnel stage ID. */
  id: string;
  /** Funnel stage designation. */
  nome: string;
  /** Cumulative opportunities count. */
  qtd: number;
  /** Sum currency value in BRL. */
  valor: number;
};

/** Origin channel count. */
export type Origem = {
  /** Origin source name. */
  nome: string;
  /** Opportunity count. */
  qtd: number;
  /** Associated brand palette hex color. */
  cor: string;
};

/** Reason for lost opportunity count. */
export type MotivoPerda = {
  /** Loss reason category. */
  nome: string;
  /** Count of lost deals. */
  qtd: number;
};

/** Sales pipeline opportunity. */
export type Oportunidade = {
  /** Unique opportunity code. */
  id: string;
  /** Client registry ID. */
  cliente: string;
  /** Owner coordination ID. */
  coord: string;
  /** Target catalog service ID. */
  servico: string;
  /** Current active stage. */
  fase: string;
  /** Estimated deal value. */
  valor: number;
  /** Acquisition source channel. */
  origem: string;
  /** Creation month string. */
  criada: string;
  /** True if registered in previous cycles. */
  antiga: boolean;
  /** Specific reason for cancellation, if lost. */
  motivoPerda: string | null;
};

/** Signed project contract metrics. */
export type Contrato = {
  /** Contract registry ID. */
  id: string;
  /** Target project ID. */
  projeto: string;
  /** Client ID. */
  cliente: string;
  /** Owner coordination ID. */
  coord: string;
  /** Financial valuation. */
  valor: number;
  /** Payment method type (e.g. 'À vista', 'Parcelado'). */
  forma: string;
  /** Installment total count. */
  parcelasTot: number;
  /** Paid installments count. */
  parcelasPagas: number;
  /** Unpaid installments count. */
  parcelasPendentes: number;
  /** Status tag ('quitado', 'em-dia', 'aberto'). */
  status: string;
  /** Signed date month. */
  assinado: string;
};

/** Financial transaction record. */
export type Transacao = {
  /** Transaction transaction ID. */
  id: string;
  /** Cash flow direction ('entrada' or 'saida'). */
  tipo: "entrada" | "saida";
  /** Valuation. */
  valor: number;
  /** Target category. */
  categoria: string;
  /** Operating bank account. */
  conta: string;
  /** Associated contract ID, if any. */
  contrato: string | null;
  /** Associated project ID, if any. */
  projeto: string | null;
  /** Associated client ID, if any. */
  cliente: string | null;
  /** Recorded date string. */
  data: string;
};

const coordenacoes: Coordenacao[] = [
  { id: "C-A", nome: "Coordenação A", tema: "Estratégia & Gestão", cor: "#0067FF" },
  { id: "C-B", nome: "Coordenação B", tema: "Processos & Operações", cor: "#00B894" },
  { id: "C-C", nome: "Coordenação C", tema: "Dados & Tecnologia", cor: "#7C4DFF" },
  { id: "C-D", nome: "Coordenação D", tema: "Marketing & Vendas", cor: "#F5A623" },
  { id: "C-E", nome: "Coordenação E", tema: "Finanças & Controle", cor: "#22C0FF" },
  { id: "C-F", nome: "Coordenação F", tema: "Pessoas & Cultura", cor: "#E5484D" },
];

const celulas: Celula[] = Array.from({ length: 6 }, (_, i) => ({
  id: "CEL-" + (i + 1),
  nome: "Célula " + String.fromCharCode(65 + i),
  membros: 0,
}));

const cargos: Cargo[] = [
  { id: "CG-1", nome: "Diretoria", nivel: 1 },
  { id: "CG-2", nome: "Coordenação", nivel: 2 },
  { id: "CG-3", nome: "Consultoria Sênior", nivel: 3 },
  { id: "CG-4", nome: "Consultoria", nivel: 4 },
  { id: "CG-5", nome: "Assessoria", nivel: 5 },
  { id: "CG-6", nome: "Trainee", nivel: 6 },
];

const servicos: Servico[] = [
  { id: "S-01", nome: "Planejamento Estratégico", coord: "C-A", projetos: 0, opp: 9 },
  { id: "S-02", nome: "Diagnóstico Organizacional", coord: "C-A", projetos: 0, opp: 6 },
  { id: "S-03", nome: "Mapeamento de Processos", coord: "C-B", projetos: 0, opp: 11 },
  { id: "S-04", nome: "Gestão de Indicadores", coord: "C-B", projetos: 0, opp: 5 },
  { id: "S-05", nome: "Análise de Dados / BI", coord: "C-C", projetos: 0, opp: 8 },
  { id: "S-06", nome: "Automação & Sistemas", coord: "C-C", projetos: 0, opp: 7 },
  { id: "S-07", nome: "Pesquisa de Mercado", coord: "C-D", projetos: 0, opp: 6 },
  { id: "S-08", nome: "Plano de Marketing", coord: "C-D", projetos: 0, opp: 4 },
  { id: "S-09", nome: "Estruturação Financeira", coord: "C-E", projetos: 0, opp: 5 },
  { id: "S-10", nome: "Gestão de Pessoas", coord: "C-F", projetos: 0, opp: 3 },
];

const segmentos = ["Indústria", "Varejo", "Serviços", "Tecnologia", "Saúde", "Agro", "Educação", "Construção"];
const clientes: Cliente[] = Array.from({ length: 12 }, (_, i) => ({
  id: "CLI-" + String(i + 1).padStart(2, "0"),
  nome: "Cliente " + String.fromCharCode(65 + i),
  segmento: segmentos[i % segmentos.length],
  desde: 2021 + (i % 5),
  projetos: 0,
  receita: 0,
}));

const cargoDist = [1, 6, 8, 14, 8, 5];
const membros: Membro[] = [];
let mIdx = 0;
cargoDist.forEach((qtd, ci) => {
  for (let k = 0; k < qtd; k++) {
    mIdx++;
    const cel = celulas[(mIdx + ci) % celulas.length];
    const coord = coordenacoes[(mIdx * 2 + ci) % coordenacoes.length];
    cel.membros++;
    membros.push({
      id: "M-" + String(mIdx).padStart(2, "0"),
      nome: "Membro " + String(mIdx).padStart(2, "0"),
      cargo: cargos[ci].id,
      cargoNome: cargos[ci].nome,
      celula: cel.id,
      coord: coord.id,
      projetos: [],
      transversal: mIdx % 7 === 0,
      ativo: mIdx % 13 !== 0,
      entrada: ["2021", "2022", "2023", "2024", "2025"][mIdx % 5],
    });
  }
});

const statusProj = [
  { k: "ativo", label: "Em execução", cls: "info" },
  { k: "concluido", label: "Concluído", cls: "success" },
  { k: "risco", label: "Em atenção", cls: "warning" },
  { k: "pausado", label: "Pausado", cls: "neutral" },
];
const projetos: Projeto[] = Array.from({ length: 14 }, (_, i) => {
  const st = statusProj[i % 4];
  const coord = coordenacoes[i % coordenacoes.length];
  const cli = clientes[i % clientes.length];
  const valor = 28000 + ((i * 9700) % 180000) + (i % 3) * 22000;
  const prog =
    st.k === "concluido" ? 100 : st.k === "pausado" ? 40 + ((i * 7) % 30) : 20 + ((i * 13) % 75);
  cli.projetos++;
  cli.receita += valor;
  const eqSize = 3 + (i % 4);
  const equipe = membros.slice((i * 3) % 30, ((i * 3) % 30) + eqSize).map((m) => m.id);
  const svcs = [servicos[i % servicos.length].id];
  if (i % 3 === 0) svcs.push(servicos[(i + 5) % servicos.length].id);
  svcs.forEach((sid) => {
    const s = servicos.find((x) => x.id === sid);
    if (s) s.projetos++;
  });
  const pid = "P-" + String(i + 1).padStart(2, "0");
  equipe.forEach((mid) => {
    const m = membros.find((x) => x.id === mid);
    if (m) m.projetos.push(pid);
  });
  return {
    id: pid,
    nome: "Projeto " + String.fromCharCode(65 + i),
    status: st.k,
    statusLabel: st.label,
    statusCls: st.cls,
    coord: coord.id,
    cliente: cli.id,
    valor,
    progresso: prog,
    equipe,
    servicos: svcs,
    temContrato: i % 5 !== 2,
    acompanhamentos: 2 + ((i * 3) % 9),
    inicio: ["jan/25", "fev/25", "mar/25", "abr/25", "nov/24", "set/24"][i % 6],
    prazo: ["jun/25", "ago/25", "set/25", "dez/25", "jul/25"][i % 5],
    saude: st.k === "risco" ? "atencao" : st.k === "concluido" ? "ok" : i % 4 === 0 ? "atencao" : "ok",
  };
});

const fases: Fase[] = [
  { id: "F1", nome: "Lead", qtd: 64, valor: 1280000 },
  { id: "F2", nome: "Qualificação", qtd: 41, valor: 980000 },
  { id: "F3", nome: "Proposta", qtd: 27, valor: 760000 },
  { id: "F4", nome: "Negociação", qtd: 16, valor: 540000 },
  { id: "F5", nome: "Fechamento", qtd: 9, valor: 380000 },
];
const origens: Origem[] = [
  { nome: "Indicação", qtd: 38, cor: "#0067FF" },
  { nome: "Inbound / Site", qtd: 24, cor: "#22C0FF" },
  { nome: "Evento", qtd: 17, cor: "#7C4DFF" },
  { nome: "Prospecção ativa", qtd: 14, cor: "#00B894" },
  { nome: "Parceria", qtd: 9, cor: "#F5A623" },
];
const motivosPerda: MotivoPerda[] = [
  { nome: "Preço", qtd: 12 },
  { nome: "Timing / Postergado", qtd: 9 },
  { nome: "Sem fit", qtd: 7 },
  { nome: "Concorrência", qtd: 6 },
  { nome: "Sem resposta", qtd: 5 },
];
const faseLabels = ["Lead", "Qualificação", "Proposta", "Negociação", "Ganho", "Perdido", "Postergado"];
const oportunidades: Oportunidade[] = Array.from({ length: 22 }, (_, i) => {
  const fl = faseLabels[i % faseLabels.length];
  const coord = coordenacoes[i % coordenacoes.length];
  const cli = clientes[i % clientes.length];
  const antiga = i % 4 === 0;
  return {
    id: "OPP-" + String(i + 1).padStart(3, "0"),
    cliente: cli.id,
    coord: coord.id,
    servico: servicos[i % servicos.length].id,
    fase: fl,
    valor: 18000 + ((i * 8300) % 140000),
    origem: origens[i % origens.length].nome,
    criada: antiga
      ? ["mar/23", "jul/22", "out/23", "jan/24"][i % 4]
      : ["fev/26", "mar/26", "abr/26", "mai/26"][i % 4],
    antiga,
    motivoPerda: fl === "Perdido" ? motivosPerda[i % motivosPerda.length].nome : null,
  };
});

const contratos: Contrato[] = projetos
  .filter((p) => p.temContrato)
  .map((p, i) => {
    const parcelasTot = [1, 3, 6, 4, 12][i % 5];
    const pagas = Math.min(parcelasTot, Math.round(parcelasTot * (p.progresso / 100)));
    return {
      id: "CT-" + String(i + 1).padStart(3, "0"),
      projeto: p.id,
      cliente: p.cliente,
      coord: p.coord,
      valor: p.valor,
      forma: ["À vista", "Parcelado", "Mensal recorrente", "Por entrega"][i % 4],
      parcelasTot,
      parcelasPagas: pagas,
      parcelasPendentes: parcelasTot - pagas,
      status: pagas === parcelasTot ? "quitado" : pagas === 0 ? "aberto" : "em-dia",
      assinado: ["jan/25", "fev/25", "mar/25", "nov/24", "abr/25"][i % 5],
    };
  });

const contas = ["Conta Operacional", "Conta Investimento", "Caixa"];
const categoriasIn = ["Receita de Projetos", "Receita Recorrente", "Outras Receitas"];
const categoriasOut = ["Folha & Pessoas", "Estrutura & Operação", "Marketing", "Impostos", "Tecnologia"];
const transacoes: Transacao[] = [];
let tIdx = 0;
contratos.forEach((c, i) => {
  for (let p = 0; p < c.parcelasPagas; p++) {
    tIdx++;
    transacoes.push({
      id: "TX-" + String(tIdx).padStart(3, "0"),
      tipo: "entrada",
      valor: Math.round(c.valor / c.parcelasTot),
      categoria: categoriasIn[i % categoriasIn.length],
      conta: contas[i % contas.length],
      contrato: c.id,
      projeto: c.projeto,
      cliente: c.cliente,
      data: ["jan/26", "fev/26", "mar/26", "abr/26", "mai/26"][(i + p) % 5],
    });
  }
});
for (let i = 0; i < 20; i++) {
  tIdx++;
  transacoes.push({
    id: "TX-" + String(tIdx).padStart(3, "0"),
    tipo: "saida",
    valor: 8000 + ((i * 4300) % 60000),
    categoria: categoriasOut[i % categoriasOut.length],
    conta: contas[i % contas.length],
    contrato: null,
    projeto: null,
    cliente: null,
    data: ["jan/26", "fev/26", "mar/26", "abr/26", "mai/26"][i % 5],
  });
}

const totalEntradas = transacoes.filter((t) => t.tipo === "entrada").reduce((s, t) => s + t.valor, 0);
const totalSaidas = transacoes.filter((t) => t.tipo === "saida").reduce((s, t) => s + t.valor, 0);
const receitaContratada = contratos.reduce((s, c) => s + c.valor, 0);

/**
 * Consolidated mock database representing the relational dataset of the enterprise.
 * Serves as a single source of truth for dummy data query mapping in early phases.
 */
export const DB = {
  /** List of coordination divisions. */
  coordenacoes,
  /** List of cell departments. */
  celulas,
  /** List of hierarchy cargo titles. */
  cargos,
  /** List of service catalog offerings. */
  servicos,
  /** List of clients. */
  clientes,
  /** List of members. */
  membros,
  /** List of projects. */
  projetos,
  /** List of funnel stages. */
  fases,
  /** List of marketing/lead sources. */
  origens,
  /** List of loss reason statistics. */
  motivosPerda,
  /** List of opportunities. */
  oportunidades,
  /** List of contracts. */
  contratos,
  /** List of financial transactions. */
  transacoes,
  /** Bank accounts. */
  contas,
  /** Incoming revenue categories. */
  categoriasIn,
  /** Outgoing expense categories. */
  categoriasOut,
  /** Aggregated KPI counters. */
  resumo: {
    membrosAtivos: membros.filter((m) => m.ativo).length,
    membrosTotal: membros.length,
    projetosAtivos: projetos.filter((p) => p.status === "ativo").length,
    projetosTotal: projetos.length,
    clientesAtivos: clientes.length,
    oppAbertas: oportunidades.filter((o) => !["Ganho", "Perdido"].includes(o.fase)).length,
    receitaContratada,
    totalEntradas,
    totalSaidas,
    resultado: totalEntradas - totalSaidas,
    ticketMedio: Math.round(receitaContratada / contratos.length),
    taxaConversao: 14,
    coordCount: coordenacoes.length,
    celulaCount: celulas.length,
    servicoCount: servicos.length,
    contratoCount: contratos.length,
  },
  /** Resolves a coordination name by its ID. */
  nomeCoord: (id: string) => coordenacoes.find((c) => c.id === id)?.nome ?? id,
  /** Resolves a coordination color by its ID. */
  corCoord: (id: string) => coordenacoes.find((c) => c.id === id)?.cor ?? "#6B7299",
  /** Resolves a cell name by its ID. */
  nomeCelula: (id: string) => celulas.find((c) => c.id === id)?.nome ?? id,
  /** Resolves a client name by its ID. */
  nomeCliente: (id: string) => clientes.find((c) => c.id === id)?.nome ?? id,
  /** Resolves a service name by its ID. */
  nomeServico: (id: string) => servicos.find((s) => s.id === id)?.nome ?? id,
  /** Resolves a project name by its ID. */
  nomeProjeto: (id: string) => projetos.find((p) => p.id === id)?.nome ?? id,
  /** Resolves a cargo name by its ID. */
  nomeCargo: (id: string) => cargos.find((c) => c.id === id)?.nome ?? id,
};
