export interface BrasilApiCnpjResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: string;
  descricao_situacao_cadastral: string;
  cnae_fiscal_descricao: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  ddd_telefone_1: string;
  ddd_telefone_2?: string;
  email?: string;
  porte?: string;
  natureza_juridica?: string;
}

export interface BrasilApiCepResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  location?: {
    type: string;
    coordinates?: {
      longitude: string;
      latitude: string;
    };
  };
}

export function cleanDocument(val: string): string {
  return val.replace(/\D/g, '');
}

export function formatCnpj(val: string): string {
  const digits = cleanDocument(val).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

export function formatCep(val: string): string {
  const digits = cleanDocument(val).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function formatPhone(val: string): string {
  const digits = cleanDocument(val).slice(0, 11);
  if (digits.length <= 2) return digits.length > 0 ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export async function fetchCnpjData(cnpjInput: string): Promise<BrasilApiCnpjResponse> {
  const clean = cleanDocument(cnpjInput);
  if (clean.length !== 14) {
    throw new Error('CNPJ deve conter exatamente 14 dígitos numéricos.');
  }

  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('CNPJ não encontrado na base da Receita Federal.');
    }
    throw new Error(`Falha ao consultar CNPJ na Brasil API (código ${response.status}).`);
  }

  return response.json();
}

export async function fetchCepData(cepInput: string): Promise<BrasilApiCepResponse> {
  const clean = cleanDocument(cepInput);
  if (clean.length !== 8) {
    throw new Error('CEP deve conter exatamente 8 dígitos numéricos.');
  }

  const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${clean}`);
  if (!response.ok) {
    throw new Error(`Falha ao consultar CEP na Brasil API (código ${response.status}).`);
  }

  return response.json();
}
