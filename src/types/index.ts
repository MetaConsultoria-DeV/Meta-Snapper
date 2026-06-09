/**
 * Tipos de domínio do BDU — contrato esperado das respostas da API FastAPI.
 * Alinhados a docs/database/schema.sql e backend/models.py.
 *
 * Provisório: os shapes definitivos serão confirmados ao criar os endpoints
 * na Phase 4. As páginas usam mocks (mock-data.ts) até a Phase 5.
 */

export type Coordenacao = {
  id: number;
  nome: string;
  sigla?: string | null;
};

export type Cargo = {
  id: number;
  nome: string;
  nivel?: number | null;
};

export type Celula = {
  id: number;
  nome: string;
  sigla?: string | null;
};

export type Membro = {
  id: number;
  nome: string;
  email?: string | null;
  cargo?: string | null;
  coordenacao?: string | null;
  coordenacao_sigla?: string | null;
};

export type Servico = {
  id: number;
  nome: string;
  sigla?: string | null;
  coordenacao_id?: number | null;
};

export type Cliente = {
  id: number;
  nome: string;
  segmento?: string | null;
};

export type ProjetoStatus = "ativo" | "concluido" | "risco" | "pausado" | string;

export type Projeto = {
  id: number;
  nome: string;
  numero_contrato?: string | null;
  valor_total?: number | null;
  status?: ProjetoStatus | null;
};

export type Oportunidade = {
  id: number;
  cliente_id?: number | null;
  coordenacao_id?: number | null;
  servico_id?: number | null;
  fase?: string | null;
  valor?: number | null;
  origem?: string | null;
  criada_em?: string | null;
  motivo_perda?: string | null;
};

export type Contrato = {
  id: number;
  numero?: string | null;
  cliente_id?: number | null;
  projeto_externo_id?: number | null;
  valor_total?: number | null;
};

export type ContratoPagamento = {
  id: number;
  contrato_id: number;
  projeto_externo_id?: number | null;
  valor?: number | null;
  vencimento?: string | null;
  pago?: boolean | null;
};

export type Transacao = {
  id: number;
  tipo: "entrada" | "saida" | string;
  valor: number;
  categoria?: string | null;
  conta?: string | null;
  contrato_pagamento_id?: number | null;
  projeto_externo_id?: number | null;
  data?: string | null;
};
