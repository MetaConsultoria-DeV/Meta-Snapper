/**
 * Fetchers tipados dos endpoints /api/bdu/* (backend/routers/bdu.py).
 * Os shapes batem 1:1 com o que o router devolve.
 *
 * Uso na Phase 5: páginas (Server Components) chamam estes fetchers via o seam
 * `data-source.ts` quando DATA_SOURCE === "api". Verificação runtime depende
 * do backend rodando contra o MySQL (VPS).
 */
import { apiGet } from "./client";

/** Detailed overview metrics of the entire organization. */
export type OverviewDTO = {
  /** Total count of active members in the organization. */
  membros: number;
  /** Total count of active projects. */
  projetos: number;
  /** Total count of signed/active contracts. */
  contratos: number;
  /** Total count of active coordination divisions. */
  coordenacoes: number;
  /** Total count of active cell departments. */
  celulas: number;
  /** Total count of services listed in the service catalog. */
  servicos: number;
  /** Total count of unique active clients. */
  clientes: number;
  /** Number of active opportunities in the pipeline. */
  oportunidades_abertas: number;
  /** Cumulative revenue contracted for the selected period. */
  receita_contratada: number;
  /** Total incoming financial transactions. */
  total_entradas: number;
  /** Total outgoing financial transactions. */
  total_saidas: number;
  /** Net balance (entradas - saidas). */
  resultado: number;
  /** Average value per contract. */
  ticket_medio: number;
};

/** Department Cell representation. */
export type CelulaDTO = {
  /** Unique ID of the cell. */
  id: number;
  /** Name of the cell. */
  nome: string;
  /** Sigla (short label abbreviation). */
  sigla: string;
  /** Count of members in this cell. */
  membros: number;
};

/** Representation of an individual member. */
export type PessoaDTO = {
  /** Unique member ID. */
  id: number;
  /** First and last name. */
  nome: string;
  /** Corporate email address. */
  email: string;
  /** Position titles assigned (comma-separated if multiple). */
  cargos: string | null;
  /** Cell name to which the member belongs. */
  celula: string | null;
  /** Coordenação divisions associated. */
  coordenacoes: string | null;
};

/** Funnel stage overview metrics. */
export type FunilFaseDTO = {
  /** The stage description. */
  fase: string;
  /** Quantity of opportunities in this stage. */
  qtd: number;
  /** Sum value of all opportunities in this stage. */
  valor: number;
};

/** Representation of a sales opportunity. */
export type OportunidadeDTO = {
  /** Unique opportunity identifier. */
  id: number;
  /** Current funnel stage name. */
  fase: string;
  /** Projected revenue value. */
  valor: number | null;
  /** Closed state status ('ganho', 'perdido', etc.). */
  status_terminal: string;
  /** Date string of registration. */
  criado_em: string | null;
  /** Members responsible for lead negotiation (comma-separated). */
  responsaveis: string | null;
  /** Name of lead contact/prospect. */
  lead: string | null;
  /** Name of client organization. */
  cliente: string | null;
  /** Name of division coordination. */
  coordenacao: string | null;
  /** Abbreviated signature tag of division coordination. */
  coordenacao_sigla: string | null;
  /** Marketing or lead channel origin. */
  origem: string | null;
  /** Primary reason for loss, if opportunity was lost. */
  motivo_perda: string | null;
};

/** Key-Value generic DTO for counting. */
export type NomeQtdDTO = {
  /** Category or segment name. */
  nome: string;
  /** Item count. */
  qtd: number;
};

/** Client commercial stats. */
export type ClienteComercialDTO = {
  /** Unique client ID. */
  id: number;
  /** Organization name. */
  nome: string;
  /** Total opportunities registered. */
  oportunidades: number;
  /** Signed projects count. */
  contratos: number;
  /** Sum revenue. */
  receita: number;
};

/** Project contract representation. */
export type ContratoDTO = {
  /** Unique contract ID. */
  id: number;
  /** Legal or tracking number of the document. */
  numero: string | null;
  /** Contracted amount. */
  valor_total: number | null;
  /** Total installments configured. */
  quantidade_parcelas: number | null;
  /** Active stage status (e.g. 'em-vigencia'). */
  fase_atual: string | null;
  /** Name of client. */
  cliente: string | null;
  /** Associated project name. */
  projeto: string | null;
  /** Number of paid installments. */
  parcelas_pagas: number;
  /** Total installments. */
  parcelas_total: number;
};

/** Cash flow transaction. */
export type TransacaoDTO = {
  /** Unique transaction ID. */
  id: number;
  /** Type of cash movement ('entrada' or 'saida'). */
  tipo: "entrada" | "saida";
  /** Movement amount in BRL cents/reais. */
  valor: number;
  /** Recorded payment date. */
  data: string | null;
  /** Target bank account. */
  conta: string | null;
  /** Classification category. */
  categoria: string | null;
  /** Installment reference ID, if linked to a contract. */
  contrato_pagamento_id: number | null;
  /** Internal ID link for external projects. */
  projeto_externo_id: number | null;
  /** Name of associated project. */
  projeto: string | null;
};

/** Monthly aggregate financial flow. */
export type FluxoMesDTO = {
  /** The calendar month reference (e.g. '2026-05'). */
  mes: string;
  /** Total incoming revenues. */
  entrada: number;
  /** Total outgoing expenses. */
  saida: number;
};

/** Bank account balance. */
export type ContaSaldoDTO = {
  /** Account designation name. */
  conta: string;
  /** Consolidated current balance. */
  saldo: number;
};

/** Service Portfolio indicators. */
export type ServicoPortfolioDTO = {
  /** Unique service identifier. */
  id: number;
  /** Service designation name. */
  nome: string;
  /** Service signature acronym. */
  sigla: string;
  /** Coordination department ID. */
  coordenacao_id: number;
  /** Coordination department name. */
  coordenacao: string;
  /** Coordination acronym tag. */
  coordenacao_sigla: string;
  /** Total projects delivered. */
  projetos: number;
  /** Total sales opportunities linked. */
  oportunidades: number;
};

/** Consolidated fact record representing a relational project team mapping. */
export type FactDTO = {
  /** Associated project ID. */
  projeto_id: number;
  /** Name of the project. */
  projeto: string;
  /** Project description details. */
  descricao: string | null;
  /** Project delivery status. */
  status: string | null;
  /** Financial valuation of the project. */
  valor: number;
  /** Associated member ID. */
  membro_id: number | null;
  /** Name of the member. */
  membro: string | null;
  /** Coordinating division department. */
  coordenacao: string | null;
  /** Coordinating division acronym. */
  coordenacao_sigla: string | null;
  /** Title/role of the member. */
  cargo: string | null;
  /** Cell containing the member. */
  celula: string | null;
  /** Client organization name. */
  cliente: string | null;
};

/** Optional start and end boundaries for queries. */
type Periodo = { data_inicio?: string; data_fim?: string };

/**
 * Interface collection wrapper exposing type-safe queries against /api/bdu endpoints.
 */
export const bduApi = {
  /**
   * Fetches high-level metrics summary for the dashboard home screen.
   *
   * @param {Periodo} [p={}] - Optional date range boundary.
   * @returns {Promise<OverviewDTO>} General metrics summary.
   */
  overview: (p: Periodo = {}) => apiGet<OverviewDTO>("/api/bdu/overview", { params: p, cache: "no-store" }),

  /**
   * Fetches the complete list of cells and departments in the organization.
   * Cached for 900 seconds (15 minutes).
   *
   * @returns {Promise<CelulaDTO[]>} List of cells.
   */
  celulas: () => apiGet<CelulaDTO[]>("/api/bdu/estrutura/celulas", { next: { revalidate: 900 } }),

  /**
   * Fetches the list of all members mapped to their cells and coordination levels.
   * Cached for 900 seconds (15 minutes).
   *
   * @returns {Promise<PessoaDTO[]>} List of members.
   */
  pessoas: () => apiGet<PessoaDTO[]>("/api/bdu/estrutura/pessoas", { next: { revalidate: 900 } }),

  /**
   * Fetches sales funnel stages and their metrics for pipeline visualizers.
   * Cached for 60 seconds (1 minute).
   *
   * @param {Periodo} [p={}] - Optional date range boundary.
   * @returns {Promise<FunilFaseDTO[]>} Pipeline funnel stages.
   */
  funil: (p: Periodo = {}) => apiGet<FunilFaseDTO[]>("/api/bdu/comercial/funil", { params: p, next: { revalidate: 60 } }),

  /**
   * Fetches individual opportunities in the sales pipeline.
   * Cached for 60 seconds (1 minute).
   *
   * @param {Periodo} [p={}] - Optional date range boundary.
   * @returns {Promise<OportunidadeDTO[]>} List of pipeline opportunities.
   */
  oportunidades: (p: Periodo = {}) =>
    apiGet<OportunidadeDTO[]>("/api/bdu/comercial/oportunidades", { params: p, next: { revalidate: 60 } }),

  /**
   * Fetches data regarding lead origin channels.
   * Cached for 60 seconds (1 minute).
   *
   * @param {Periodo} [p={}] - Optional date range boundary.
   * @returns {Promise<NomeQtdDTO[]>} Channel counts.
   */
  origens: (p: Periodo = {}) => apiGet<NomeQtdDTO[]>("/api/bdu/comercial/origens", { params: p, next: { revalidate: 60 } }),

  /**
   * Fetches common reasons for lost sales opportunities.
   * Cached for 60 seconds (1 minute).
   *
   * @param {Periodo} [p={}] - Optional date range boundary.
   * @returns {Promise<NomeQtdDTO[]>} Reason counts.
   */
  motivosPerda: (p: Periodo = {}) =>
    apiGet<NomeQtdDTO[]>("/api/bdu/comercial/motivos-perda", { params: p, next: { revalidate: 60 } }),

  /**
   * Fetches standard commercial performance indicators for active clients.
   * Cached for 300 seconds (5 minutes).
   *
   * @returns {Promise<ClienteComercialDTO[]>} Client list.
   */
  clientesComercial: () => apiGet<ClienteComercialDTO[]>("/api/bdu/comercial/clientes", { next: { revalidate: 300 } }),

  /**
   * Fetches all signed project contracts. Always fetched dynamically from the database (no-store).
   *
   * @param {Periodo} [p={}] - Optional date range boundary.
   * @returns {Promise<ContratoDTO[]>} List of project contracts.
   */
  contratos: (p: Periodo = {}) => apiGet<ContratoDTO[]>("/api/bdu/financeiro/contratos", { params: p, cache: "no-store" }),

  /**
   * Fetches transactions matching query filters. Always fetched dynamically from the database (no-store).
   *
   * @param {Periodo & { tipo?: "entrada" | "saida" }} [p={}] - Filters containing date boundaries and direction.
   * @returns {Promise<TransacaoDTO[]>} List of matching transactions.
   */
  transacoes: (p: Periodo & { tipo?: "entrada" | "saida" } = {}) =>
    apiGet<TransacaoDTO[]>("/api/bdu/financeiro/transacoes", { params: p, cache: "no-store" }),

  /**
   * Fetches monthly aggregates of incoming and outgoing flows. Always fetched dynamically (no-store).
   *
   * @param {Periodo} [p={}] - Optional date range boundary.
   * @returns {Promise<FluxoMesDTO[]>} Monthly aggregate list.
   */
  fluxo: (p: Periodo = {}) => apiGet<FluxoMesDTO[]>("/api/bdu/financeiro/fluxo", { params: p, cache: "no-store" }),

  /**
   * Fetches balance status of all operational/investment bank accounts. Always fetched dynamically (no-store).
   *
   * @param {Periodo} [p={}] - Optional date range boundary.
   * @returns {Promise<ContaSaldoDTO[]>} List of account balances.
   */
  contas: (p: Periodo = {}) => apiGet<ContaSaldoDTO[]>("/api/bdu/financeiro/contas", { params: p, cache: "no-store" }),

  /**
   * Fetches portfolios of services with aggregate count metrics.
   * Cached for 900 seconds (15 minutes).
   *
   * @param {Periodo} [p={}] - Optional date range boundary.
   * @returns {Promise<ServicoPortfolioDTO[]>} Portfolio service items.
   */
  servicosPortfolio: (p: Periodo = {}) =>
    apiGet<ServicoPortfolioDTO[]>("/api/bdu/servicos/portfolio", { params: p, next: { revalidate: 900 } }),

  /**
   * Fetches cross-cutting project fact entries mapping members, roles, cells and clients.
   * Cached for 900 seconds (15 minutes).
   *
   * @returns {Promise<FactDTO[]>} Project relational facts array.
   */
  transversaisFacts: () => apiGet<FactDTO[]>("/api/bdu/transversais/facts", { next: { revalidate: 900 } }),
};
