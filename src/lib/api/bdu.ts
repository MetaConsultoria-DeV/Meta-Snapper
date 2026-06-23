/**
 * Fetchers tipados dos endpoints /api/bdu/* (backend/routers/bdu.py).
 * Os shapes batem 1:1 com o que o router devolve.
 *
 * Uso na Phase 5: páginas (Server Components) chamam estes fetchers via o seam
 * `data-source.ts` quando DATA_SOURCE === "api". Verificação runtime depende
 * do backend rodando contra o MySQL (VPS).
 */
import { apiGet } from "./client";

export type OverviewDTO = {
  membros: number;
  projetos: number;
  contratos: number;
  coordenacoes: number;
  celulas: number;
  servicos: number;
  clientes: number;
  oportunidades_abertas: number;
  receita_contratada: number;
  total_entradas: number;
  total_saidas: number;
  resultado: number;
  ticket_medio: number;
};

export type CelulaDTO = { id: number; nome: string; sigla: string; membros: number };
export type PessoaDTO = {
  id: number;
  nome: string;
  email: string;
  cargos: string | null;
  celula: string | null;
  coordenacoes: string | null;
};

export type FunilFaseDTO = { fase: string; qtd: number; valor: number };
export type OportunidadeDTO = {
  id: number;
  fase: string;
  valor: number | null;
  status_terminal: string;
  criado_em: string | null;
  responsaveis: string | null;
  lead: string | null;
  cliente: string | null;
  coordenacao: string | null;
  coordenacao_sigla: string | null;
  origem: string | null;
  motivo_perda: string | null;
};
export type NomeQtdDTO = { nome: string; qtd: number };
export type ClienteComercialDTO = {
  id: number;
  nome: string;
  oportunidades: number;
  contratos: number;
  receita: number;
};

export type ContratoDTO = {
  id: number;
  numero: string | null;
  valor_total: number | null;
  quantidade_parcelas: number | null;
  fase_atual: string | null;
  cliente: string | null;
  projeto: string | null;
  parcelas_pagas: number;
  parcelas_total: number;
};
export type TransacaoDTO = {
  id: number;
  tipo: "entrada" | "saida";
  valor: number;
  data: string | null;
  conta: string | null;
  categoria: string | null;
  contrato_pagamento_id: number | null;
  projeto_externo_id: number | null;
  projeto: string | null;
};
export type FluxoMesDTO = { mes: string; entrada: number; saida: number };
export type ContaSaldoDTO = { conta: string; saldo: number };

export type ServicoPortfolioDTO = {
  id: number;
  nome: string;
  sigla: string;
  coordenacao_id: number;
  coordenacao: string;
  coordenacao_sigla: string;
  projetos: number;
  oportunidades: number;
};

export type FactDTO = {
  projeto_id: number;
  projeto: string;
  descricao: string | null;
  status: string | null;
  valor: number;
  membro_id: number | null;
  membro: string | null;
  coordenacao: string | null;
  coordenacao_sigla: string | null;
  cargo: string | null;
  celula: string | null;
  cliente: string | null;
};

type Periodo = { data_inicio?: string; data_fim?: string };

export const bduApi = {
  // Dashboard & Estrutura
  overview: (p: Periodo = {}) => apiGet<OverviewDTO>("/api/bdu/overview", { params: p, cache: "no-store" }),
  celulas: () => apiGet<CelulaDTO[]>("/api/bdu/estrutura/celulas", { next: { revalidate: 900 } }),
  pessoas: () => apiGet<PessoaDTO[]>("/api/bdu/estrutura/pessoas", { next: { revalidate: 900 } }),

  // Comercial
  funil: (p: Periodo = {}) => apiGet<FunilFaseDTO[]>("/api/bdu/comercial/funil", { params: p, next: { revalidate: 60 } }),
  oportunidades: (p: Periodo = {}) =>
    apiGet<OportunidadeDTO[]>("/api/bdu/comercial/oportunidades", { params: p, next: { revalidate: 60 } }),
  origens: (p: Periodo = {}) => apiGet<NomeQtdDTO[]>("/api/bdu/comercial/origens", { params: p, next: { revalidate: 60 } }),
  motivosPerda: (p: Periodo = {}) =>
    apiGet<NomeQtdDTO[]>("/api/bdu/comercial/motivos-perda", { params: p, next: { revalidate: 60 } }),
  clientesComercial: () => apiGet<ClienteComercialDTO[]>("/api/bdu/comercial/clientes", { next: { revalidate: 300 } }),

  // Financeiro (Tempo Real Absoluto)
  contratos: () => apiGet<ContratoDTO[]>("/api/bdu/financeiro/contratos", { cache: "no-store" }),
  transacoes: (p: Periodo & { tipo?: "entrada" | "saida" } = {}) =>
    apiGet<TransacaoDTO[]>("/api/bdu/financeiro/transacoes", { params: p, cache: "no-store" }),
  fluxo: (p: Periodo = {}) => apiGet<FluxoMesDTO[]>("/api/bdu/financeiro/fluxo", { params: p, cache: "no-store" }),
  contas: (p: Periodo = {}) => apiGet<ContaSaldoDTO[]>("/api/bdu/financeiro/contas", { params: p, cache: "no-store" }),

  // Serviços & Projetos
  servicosPortfolio: (p: Periodo = {}) =>
    apiGet<ServicoPortfolioDTO[]>("/api/bdu/servicos/portfolio", { params: p, next: { revalidate: 900 } }),
  transversaisFacts: () => apiGet<FactDTO[]>("/api/bdu/transversais/facts", { next: { revalidate: 900 } }),
};
