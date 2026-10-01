import React, { useState } from 'react';
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Mail,
  User,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ExternalLink,
  Navigation,
  Sparkles,
  Compass,
} from 'lucide-react';
import { Client, Seller } from '../../types/crm';
import {
  fetchCnpjData,
  fetchCepData,
  formatCnpj,
  formatCep,
  formatPhone,
  cleanDocument,
} from '../../services/brasilApi';
import { ClientAddressMap } from '../maps/ClientAddressMap';

interface ClientRegistrationViewProps {
  clients: Client[];
  sellers: Seller[];
  onSaveClient: (client: Client, initialDeal?: { title: string; value: number; sellerId: string }) => Promise<void>;
  onOpenPhoneModal: (clientId: string, clientName: string, phone: string) => void;
  onNavigateToRadiusSearch?: () => void;
}

export const ClientRegistrationView: React.FC<ClientRegistrationViewProps> = ({
  clients,
  sellers,
  onSaveClient,
  onOpenPhoneModal,
  onNavigateToRadiusSearch,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');
  const [searchTerm, setSearchTerm] = useState('');

  // Form Fields
  const [cnpj, setCnpj] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [segment, setSegment] = useState('Tecnologia');
  const [notes, setNotes] = useState('');

  // Address Fields
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [municipio, setMunicipio] = useState('São Paulo');
  const [uf, setUf] = useState('SP');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: -23.5505, lng: -46.6333 });

  // Optional Initial Deal creation
  const [createInitialDeal, setCreateInitialDeal] = useState(true);
  const [dealTitle, setDealTitle] = useState('');
  const [dealValue, setDealValue] = useState('35000');
  const [dealSellerId, setDealSellerId] = useState(sellers[0]?.id || '');

  // Status & Loaders
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [apiFeedback, setApiFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Brasil API CNPJ lookup
  const handleCnpjSearch = async () => {
    const clean = cleanDocument(cnpj);
    if (clean.length !== 14) {
      setApiFeedback({ type: 'error', message: 'O CNPJ deve ter 14 números.' });
      return;
    }

    setIsSearchingCnpj(true);
    setApiFeedback(null);
    try {
      const data = await fetchCnpjData(cnpj);
      setCompanyName(data.razao_social || '');
      setTradeName(data.nome_fantasia || data.razao_social || '');
      if (data.cnae_fiscal_descricao) {
        setSegment(data.cnae_fiscal_descricao.slice(0, 40));
      }
      if (data.ddd_telefone_1) {
        setPhone(formatPhone(data.ddd_telefone_1));
      }
      if (data.email) {
        setEmail(data.email.toLowerCase());
      }
      if (data.cep) {
        setCep(formatCep(data.cep));
      }
      setLogradouro(data.logradouro || '');
      setNumero(data.numero || '');
      setComplemento(data.complemento || '');
      setBairro(data.bairro || '');
      setMunicipio(data.municipio || 'São Paulo');
      setUf(data.uf || 'SP');

      // Auto update deal title suggestion
      if (!dealTitle) {
        setDealTitle(`Proposta Inicial - ${data.nome_fantasia || data.razao_social}`);
      }

      // Try geocode approximate coordinates or address
      setApiFeedback({
        type: 'success',
        message: `Dados da empresa ${data.razao_social} obtidos com sucesso pela Brasil API!`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao consultar CNPJ.';
      setApiFeedback({ type: 'error', message: msg });
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  // Brasil API CEP lookup
  const handleCepSearch = async () => {
    const clean = cleanDocument(cep);
    if (clean.length !== 8) {
      setApiFeedback({ type: 'error', message: 'O CEP deve ter 8 números.' });
      return;
    }

    setIsSearchingCep(true);
    setApiFeedback(null);
    try {
      const data = await fetchCepData(cep);
      setLogradouro(data.street || logradouro);
      setBairro(data.neighborhood || bairro);
      setMunicipio(data.city || municipio);
      setUf(data.state || uf);

      if (data.location?.coordinates?.latitude && data.location?.coordinates?.longitude) {
        setCoords({
          lat: Number(data.location.coordinates.latitude),
          lng: Number(data.location.coordinates.longitude),
        });
      }
      setApiFeedback({
        type: 'success',
        message: `Endereço localizado para o CEP ${data.cep} via Brasil API.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao consultar CEP.';
      setApiFeedback({ type: 'error', message: msg });
    } finally {
      setIsSearchingCep(false);
    }
  };

  const fullAddressString = `${logradouro} ${numero} ${bairro} ${municipio} - ${uf} ${cep}`.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !phone.trim()) {
      setApiFeedback({ type: 'error', message: 'Razão Social e Telefone são campos obrigatórios.' });
      return;
    }

    setSaving(true);
    try {
      const newClient: Client = {
        id: 'cli_' + Date.now(),
        cnpj: cnpj.trim() || undefined,
        companyName: companyName.trim(),
        tradeName: tradeName.trim() || companyName.trim(),
        contactName: contactName.trim() || 'Responsável Comercial',
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        segment: segment.trim(),
        notes: notes.trim() || undefined,
        address: {
          logradouro: logradouro.trim(),
          numero: numero.trim(),
          complemento: complemento.trim() || undefined,
          bairro: bairro.trim(),
          municipio: municipio.trim(),
          uf: uf.trim(),
          cep: cep.trim(),
          lat: coords.lat,
          lng: coords.lng,
        },
        createdAt: new Date().toISOString(),
      };

      const initialDeal = createInitialDeal && dealTitle.trim()
        ? {
            title: dealTitle.trim(),
            value: parseFloat(dealValue) || 0,
            sellerId: dealSellerId || sellers[0]?.id,
          }
        : undefined;

      await onSaveClient(newClient, initialDeal);

      // Reset
      setCnpj('');
      setCompanyName('');
      setTradeName('');
      setContactName('');
      setPhone('');
      setEmail('');
      setNotes('');
      setDealTitle('');
      setApiFeedback({
        type: 'success',
        message: `Cliente ${newClient.tradeName} cadastrado com sucesso com localização integrada!`,
      });
      setActiveTab('list');
    } catch (err) {
      console.error(err);
      setApiFeedback({ type: 'error', message: 'Erro ao cadastrar cliente.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.companyName.toLowerCase().includes(term) ||
      c.tradeName.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      c.address.municipio.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-neutral-900">Cadastro Inteligente de Clientes</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Preenchimento automático via Brasil API (CNPJ e CEP) e geolocalização visual com Google Maps
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-3.5 py-1.5 rounded-md transition-colors ${
              activeTab === 'form' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Cadastrar Novo
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-1.5 rounded-md transition-colors ${
              activeTab === 'list' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Clientes Cadastrados ({clients.length})
          </button>
          {onNavigateToRadiusSearch && (
            <button
              onClick={onNavigateToRadiusSearch}
              className="px-3 py-1.5 rounded-md text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1 font-semibold"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Buscar por Raio & CNAE</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'form' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Data input */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 p-6 shadow-2xs space-y-5">
            {/* Feedback alert */}
            {apiFeedback && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  apiFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {apiFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{apiFeedback.message}</span>
              </div>
            )}

            {/* Brasil API CNPJ Assistant */}
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Preenchimento Automático via Brasil API
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">Receita Federal</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                    placeholder="Digite o CNPJ (ex: 33.000.167/0001-01)"
                    maxLength={18}
                    className="w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCnpjSearch}
                  disabled={isSearchingCnpj}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                >
                  {isSearchingCnpj ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Consultando...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Buscar CNPJ</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500">
                Puxa automaticamente: Razão Social, Fantasia, Endereço oficial, CNAE e Contato comercial.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Razão Social *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Nome empresarial registrado"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    placeholder="Nome de marca conhecido"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Contato Principal</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Nome do decisor"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(11) 98765-4321"
                      maxLength={15}
                      className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">E-mail Comercial</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contato@empresa.com"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Segmento de Mercado</label>
                <input
                  type="text"
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                  placeholder="Ex: Logística, Tecnologia, Saúde, Varejo"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                />
              </div>

              {/* Address Fields with CEP Lookup */}
              <div className="pt-2 border-t border-neutral-100 space-y-3">
                <span className="text-xs font-bold text-neutral-900 block">Endereço & Localização</span>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">CEP</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={cep}
                        onChange={(e) => setCep(formatCep(e.target.value))}
                        placeholder="00000-000"
                        maxLength={9}
                        className="w-full px-2.5 py-1.5 text-xs font-mono border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                      />
                      <button
                        type="button"
                        onClick={handleCepSearch}
                        disabled={isSearchingCep}
                        className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs"
                        title="Buscar CEP na Brasil API"
                      >
                        {isSearchingCep ? <Loader2 className="w-3 h-3 animate-spin" /> : 'CEP'}
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs text-neutral-600 mb-1">Logradouro</label>
                    <input
                      type="text"
                      value={logradouro}
                      onChange={(e) => setLogradouro(e.target.value)}
                      placeholder="Avenida / Rua"
                      className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Número</label>
                    <input
                      type="text"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      placeholder="123"
                      className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Complemento</label>
                    <input
                      type="text"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      placeholder="Sala 402"
                      className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Bairro"
                      className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={municipio}
                      onChange={(e) => setMunicipio(e.target.value)}
                      placeholder="Município"
                      className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">UF</label>
                    <input
                      type="text"
                      value={uf}
                      maxLength={2}
                      onChange={(e) => setUf(e.target.value.toUpperCase())}
                      placeholder="SP"
                      className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Initial Deal Shortcut */}
              <div className="pt-2 border-t border-neutral-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-900">
                  <input
                    type="checkbox"
                    checked={createInitialDeal}
                    onChange={(e) => setCreateInitialDeal(e.target.checked)}
                    className="accent-neutral-900 w-4 h-4 rounded"
                  />
                  <span>Criar oportunidade inicial no funil para este cliente</span>
                </label>

                {createInitialDeal && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] text-neutral-600 mb-1">Título do Negócio</label>
                      <input
                        type="text"
                        value={dealTitle}
                        onChange={(e) => setDealTitle(e.target.value)}
                        placeholder="Ex: Aquisição de Plataforma de Gestão"
                        className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-600 mb-1">Valor Previsto (R$)</label>
                      <input
                        type="number"
                        value={dealValue}
                        onChange={(e) => setDealValue(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg bg-white font-mono"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[11px] text-neutral-600 mb-1">Vendedor Alocado</label>
                      <select
                        value={dealSellerId}
                        onChange={(e) => setDealSellerId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg bg-white"
                      >
                        {sellers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{saving ? 'Cadastrando Cliente...' : 'Cadastrar Cliente'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Google Maps Location Preview (MANDATORY REQUIREMENT) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-neutral-900">Localização com Google Maps</h3>
                </div>
                <span className="text-[11px] font-mono text-neutral-400">AdvancedMarker</span>
              </div>
              <p className="text-xs text-neutral-500">
                Visualização geográfica para visitas comerciais e rotas de vendedores em campo.
              </p>

              {/* Google Maps Component */}
              <ClientAddressMap
                lat={coords.lat}
                lng={coords.lng}
                addressLabel={fullAddressString || 'Avenida Paulista, São Paulo - SP'}
                companyName={tradeName || companyName || 'Novo Cliente'}
                onCoordinatesChange={(newLat, newLng) => setCoords({ lat: newLat, lng: newLng })}
              />

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80 text-xs space-y-1">
                <div className="font-semibold text-neutral-800">Endereço formatado:</div>
                <div className="text-neutral-600">
                  {fullAddressString || 'Preencha o CEP ou CNPJ para localizar no mapa.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Clients List */
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-[260px]">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por empresa, telefone, cidade..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900"
              />
            </div>

            <div className="text-xs text-neutral-500 font-mono tabular-nums">
              Total de clientes: <span className="font-semibold text-neutral-900">{clients.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Empresa / CNPJ</th>
                  <th className="py-3 px-4">Contato & Telefone</th>
                  <th className="py-3 px-4">Localização</th>
                  <th className="py-3 px-4">Segmento</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredClients.map((client) => {
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${client.tradeName || client.companyName} ${client.address.logradouro} ${client.address.numero} ${client.address.municipio} ${client.address.uf}`
                  )}`;

                  return (
                    <tr key={client.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-neutral-900 block">{client.tradeName}</span>
                        <span className="text-[11px] text-neutral-500 block truncate max-w-xs">{client.companyName}</span>
                        {client.cnpj && (
                          <span className="text-[11px] font-mono text-neutral-400">{client.cnpj}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-neutral-800">{client.contactName}</div>
                        <div className="flex items-center gap-1.5 text-emerald-700 font-mono tabular-nums text-[11px] mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{client.phone}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-neutral-600 text-[11px]">
                        <div>
                          {client.address.logradouro}, {client.address.numero}
                        </div>
                        <div className="text-neutral-500">
                          {client.address.bairro} - {client.address.municipio}/{client.address.uf}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-neutral-600">
                        <span className="bg-neutral-100 px-2 py-0.5 rounded text-[11px] font-medium">
                          {client.segment}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenPhoneModal(client.id, client.tradeName || client.companyName, client.phone)}
                            className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                            title="Editar telefone do cliente"
                          >
                            Editar Tel
                          </button>

                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded border border-neutral-200 transition-colors"
                            title="Abrir no Google Maps"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
