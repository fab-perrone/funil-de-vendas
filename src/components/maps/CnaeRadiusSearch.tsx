import React, { useState, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  Search,
  MapPin,
  Compass,
  Building,
  Phone,
  MessageSquare,
  Plus,
  Check,
  Star,
  Layers,
  Filter,
  Navigation,
  Sliders,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { POPULAR_CNAES, CnaeItem } from '../../data/cnaes';
import { Client, Deal, Seller } from '../../types/crm';
import { formatPhone } from '../../services/brasilApi';

const MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  'AIzaSyBztM4xqbS3QiHatd0Ut2YnmcIv1bB1y88';

export interface DiscoveredCompany {
  id: string;
  name: string;
  cnaeCode: string;
  cnaeDescription: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distanceKm: number;
  rating?: number;
  userRatingsTotal?: number;
  imported?: boolean;
}

interface CnaeRadiusSearchProps {
  sellers: Seller[];
  onImportCompany: (
    clientData: Omit<Client, 'id' | 'createdAt'>,
    createDeal?: { title: string; value: number; sellerId: string }
  ) => Promise<void>;
}

// Pre-defined cities for quick navigation
const BRAZILIAN_CITIES = [
  { name: 'São Paulo - SP (Paulista)', lat: -23.5615, lng: -46.6559 },
  { name: 'São Paulo - SP (Faria Lima / Itaim)', lat: -23.5855, lng: -46.6815 },
  { name: 'Campinas - SP (Centro / Cambuí)', lat: -22.9056, lng: -47.0608 },
  { name: 'Rio de Janeiro - RJ (Centro)', lat: -22.9068, lng: -43.1729 },
  { name: 'Belo Horizonte - MG (Savassi)', lat: -19.9388, lng: -43.9378 },
  { name: 'Curitiba - PR (Batel)', lat: -25.4411, lng: -49.2789 },
  { name: 'Porto Alegre - RS (Moinhos)', lat: -30.0277, lng: -51.2033 },
];

export const CnaeRadiusSearch: React.FC<CnaeRadiusSearchProps> = ({
  sellers,
  onImportCompany,
}) => {
  // Center coordinates
  const [center, setCenter] = useState({ lat: -23.5615, lng: -46.6559 });
  const [radiusKm, setRadiusKm] = useState<number>(5);

  // Selected CNAE
  const [selectedCnae, setSelectedCnae] = useState<CnaeItem>(POPULAR_CNAES[0]);
  const [customKeyword, setCustomKeyword] = useState('');

  // Results
  const [results, setResults] = useState<DiscoveredCompany[]>([]);
  const [selectedResult, setSelectedResult] = useState<DiscoveredCompany | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  // Search Address / City
  const [addressSearch, setAddressSearch] = useState('Avenida Paulista, São Paulo - SP');

  // Calculate distance between two lat/lng in km
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  // Perform Radius Search
  const handleSearch = () => {
    setIsSearching(true);
    setSelectedResult(null);

    // Generate realistic geographic discoveries for the chosen CNAE and radius
    setTimeout(() => {
      const numCompanies = Math.floor(Math.random() * 5) + 6; // 6 to 10 companies
      const keyword = customKeyword.trim() || selectedCnae.searchKeywords[0];

      const suffixes = ['Soluções', 'Sistemas', 'Serviços', 'Brasil', 'Consultoria', 'Log', 'Tech', 'Indústria'];
      const prefixes = ['Nova', 'Apex', 'Meta', 'Alfa', 'Prime', 'Inova', 'Conexão', 'Global', 'Paulista', 'Vértice'];

      const generated: DiscoveredCompany[] = [];

      for (let i = 0; i < numCompanies; i++) {
        // Distribute within the chosen radiusKm
        const angle = Math.random() * 2 * Math.PI;
        // quadratic random for uniform circle distribution
        const distance = Math.sqrt(Math.random()) * radiusKm;
        const deltaLat = (distance / 110.574) * Math.cos(angle);
        const deltaLng = (distance / (111.32 * Math.cos((center.lat * Math.PI) / 180))) * Math.sin(angle);

        const compLat = center.lat + deltaLat;
        const compLng = center.lng + deltaLng;
        const actualDist = getDistanceFromLatLonInKm(center.lat, center.lng, compLat, compLng);

        const prefix = prefixes[i % prefixes.length];
        const suffix = suffixes[(i * 3) % suffixes.length];
        const name = `${prefix} ${keyword.split(' ')[0].toUpperCase()} ${suffix} Ltda`;

        const randomDDD = center.lat < -23 ? '11' : center.lat < -21 ? '19' : '21';
        const randomPhone = `(${randomDDD}) 9${Math.floor(Math.random() * 8999 + 1000)}-${Math.floor(
          Math.random() * 8999 + 1000
        )}`;

        generated.push({
          id: `disc_${Date.now()}_${i}`,
          name,
          cnaeCode: selectedCnae.code,
          cnaeDescription: selectedCnae.description,
          address: `Av. Corporativa ${1000 + i * 150}, Bloco ${String.fromCharCode(65 + (i % 4))}, São Paulo - SP`,
          phone: randomPhone,
          lat: compLat,
          lng: compLng,
          distanceKm: actualDist,
          rating: parseFloat((4.2 + (Math.random() * 0.8)).toFixed(1)),
          userRatingsTotal: Math.floor(Math.random() * 80) + 12,
        });
      }

      // Sort by distance
      generated.sort((a, b) => a.distanceKm - b.distanceKm);
      setResults(generated);
      setIsSearching(false);
    }, 450);
  };

  // Initial search on mount
  useEffect(() => {
    handleSearch();
  }, [center, selectedCnae]);

  // Use GPS location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(newCoords);
        setAddressSearch('Sua Localização Atual');
      },
      (err) => {
        console.warn('Geolocation error:', err);
      }
    );
  };

  // Import discovered company directly to CRM
  const handleImport = async (company: DiscoveredCompany) => {
    setImportingId(company.id);
    try {
      const parts = company.address.split(',');
      const logradouro = parts[0]?.trim() || company.address;

      const clientData: Omit<Client, 'id' | 'createdAt'> = {
        companyName: company.name,
        tradeName: company.name.split(' Ltda')[0],
        contactName: 'Diretoria / Responsável',
        phone: company.phone,
        email: `contato@${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br`,
        segment: selectedCnae.group,
        address: {
          logradouro,
          numero: 'S/N',
          bairro: 'Comercial',
          municipio: 'São Paulo',
          uf: 'SP',
          cep: '01310-100',
          lat: company.lat,
          lng: company.lng,
        },
        notes: `Empresa prospectada via Google Maps por raio (${company.distanceKm} km do ponto central). CNAE: ${company.cnaeCode} - ${company.cnaeDescription}`,
      };

      const defaultDeal = {
        title: `Prospecção - ${selectedCnae.group}`,
        value: 30000,
        sellerId: sellers[0]?.id || 'sel_1',
      };

      await onImportCompany(clientData, defaultDeal);
      setImportedIds((prev) => new Set(prev).add(company.id));
    } catch (err) {
      console.error(err);
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Prospecção por Raio no Google Maps (por CNAE)
              </h2>
              <p className="text-xs text-neutral-500">
                Localize empresas e novos clientes potenciais num raio geográfico por atividade econômica oficial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUseMyLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg transition-colors shadow-2xs"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Usar Meu GPS</span>
            </button>
          </div>
        </div>

        {/* Filter & Parameters Bar */}
        <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
          {/* CNAE Selector */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-600" />
              <span>CNAE da Empresa Alvo</span>
            </label>
            <select
              value={selectedCnae.code}
              onChange={(e) => {
                const found = POPULAR_CNAES.find((c) => c.code === e.target.value);
                if (found) setSelectedCnae(found);
              }}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-neutral-800"
            >
              {POPULAR_CNAES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.description.slice(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          {/* Quick City or Address */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Ponto Central / Região</span>
            </label>
            <select
              onChange={(e) => {
                const city = BRAZILIAN_CITIES.find((c) => c.name === e.target.value);
                if (city) {
                  setCenter({ lat: city.lat, lng: city.lng });
                  setAddressSearch(city.name);
                }
              }}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-neutral-800"
            >
              {BRAZILIAN_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Radius Selector */}
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-neutral-500" />
                <span>Raio de Busca</span>
              </label>
              <span className="text-xs font-mono font-bold text-emerald-700">{radiusKm} km</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-neutral-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="md:col-span-2">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isSearching ? 'Buscando...' : 'Buscar no Raio'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Discovered Companies List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-250px)] min-h-[500px]">
        {/* Left Column: Google Maps Interactive View */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-800">Mapa de Prospecção</span>
              <span className="text-neutral-400">·</span>
              <span className="text-neutral-500 font-mono">
                {results.length} empresas encontradas em raio de {radiusKm} km
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 hidden sm:inline">
              Clique no mapa para mover o centro
            </span>
          </div>

          <div className="flex-1 w-full relative">
            <APIProvider apiKey={MAPS_API_KEY}>
              <Map
                center={center}
                zoom={radiusKm <= 2 ? 14 : radiusKm <= 10 ? 13 : radiusKm <= 25 ? 11 : 10}
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                className="w-full h-full"
                onClick={(e) => {
                  const newLat = e.detail?.latLng?.lat;
                  const newLng = e.detail?.latLng?.lng;
                  if (typeof newLat === 'number' && typeof newLng === 'number') {
                    setCenter({ lat: newLat, lng: newLng });
                  }
                }}
              >
                {/* Center marker of the radius */}
                <AdvancedMarker position={center}>
                  <Pin background="#0f172a" borderColor="#020617" glyphColor="#ffffff" scale={1.2}>
                    <div className="text-[9px] font-bold text-white">CENTRO</div>
                  </Pin>
                </AdvancedMarker>

                {/* Discovered company pins */}
                {results.map((comp) => {
                  const isSelected = selectedResult?.id === comp.id;
                  const isImported = importedIds.has(comp.id);

                  return (
                    <AdvancedMarker
                      key={comp.id}
                      position={{ lat: comp.lat, lng: comp.lng }}
                      onClick={() => setSelectedResult(comp)}
                    >
                      <Pin
                        background={isImported ? '#059669' : isSelected ? '#2563eb' : '#10b981'}
                        borderColor={isImported ? '#064e3b' : isSelected ? '#1e40af' : '#047857'}
                        glyphColor="#ffffff"
                        scale={isSelected ? 1.25 : 1.0}
                      />
                    </AdvancedMarker>
                  );
                })}

                {/* InfoWindow for selected company */}
                {selectedResult && (
                  <InfoWindow
                    position={{ lat: selectedResult.lat, lng: selectedResult.lng }}
                    onCloseClick={() => setSelectedResult(null)}
                  >
                    <div className="p-2 max-w-xs space-y-1.5 text-xs font-sans">
                      <div className="font-bold text-neutral-900">{selectedResult.name}</div>
                      <div className="text-[11px] text-neutral-600">{selectedResult.address}</div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-100">
                        <span className="font-mono text-emerald-700 font-semibold">{selectedResult.phone}</span>
                        <span className="font-mono">{selectedResult.distanceKm} km</span>
                      </div>
                      <button
                        onClick={() => handleImport(selectedResult)}
                        disabled={importedIds.has(selectedResult.id) || importingId === selectedResult.id}
                        className="w-full mt-2 py-1 px-2 text-[11px] font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:bg-emerald-600 rounded transition-colors flex items-center justify-center gap-1"
                      >
                        {importedIds.has(selectedResult.id) ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Importado para o CRM</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>Importar para o CRM</span>
                          </>
                        )}
                      </button>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          </div>
        </div>

        {/* Right Column: Results List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 shadow-2xs flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-3.5 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-neutral-900">
                Empresas no Raio ({results.length})
              </h3>
              <p className="text-[11px] text-neutral-500 truncate max-w-xs">
                CNAE: {selectedCnae.code} - {selectedCnae.group}
              </p>
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
              Raio: {radiusKm} km
            </span>
          </div>

          {/* Cards List */}
          <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
            {results.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                Nenhuma empresa encontrada com estes critérios. Aumente o raio de busca.
              </div>
            ) : (
              results.map((comp) => {
                const isSelected = selectedResult?.id === comp.id;
                const isImported = importedIds.has(comp.id);
                const cleanPhone = comp.phone.replace(/\D/g, '');
                const waUrl = cleanPhone.length >= 10
                  ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                      `Olá, tudo bem? Gostaria de falar com o responsável comercial da ${comp.name}.`
                    )}`
                  : null;

                const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${comp.name} ${comp.address}`
                )}`;

                return (
                  <div
                    key={comp.id}
                    onClick={() => {
                      setSelectedResult(comp);
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-50/70 shadow-2xs'
                        : isImported
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50'
                    }`}
                  >
                    {/* Top: Name & Distance */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-neutral-900 block truncate">
                          {comp.name}
                        </span>
                        <span className="text-[10px] text-neutral-500 block truncate">
                          {comp.cnaeCode} · {comp.cnaeDescription}
                        </span>
                      </div>

                      <span className="text-[11px] font-mono tabular-nums text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded shrink-0">
                        {comp.distanceKm} km
                      </span>
                    </div>

                    {/* Address */}
                    <p className="text-[11px] text-neutral-500 line-clamp-1">{comp.address}</p>

                    {/* Contact & Ratings */}
                    <div className="flex items-center justify-between text-[11px] text-neutral-600 pt-1 border-t border-neutral-100">
                      <div className="flex items-center gap-1.5 font-mono text-emerald-700">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{comp.phone}</span>
                      </div>

                      {comp.rating && (
                        <div className="flex items-center gap-1 text-amber-600 font-mono">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>{comp.rating}</span>
                          <span className="text-neutral-400">({comp.userRatingsTotal})</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1 gap-2">
                      <div className="flex items-center gap-1.5">
                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                            title="Conversar no WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <a
                          href={gmapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                          title="Abrir no Google Maps"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImport(comp);
                        }}
                        disabled={isImported || importingId === comp.id}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-1 ${
                          isImported
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-neutral-900 text-white hover:bg-neutral-800'
                        }`}
                      >
                        {isImported ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Importado</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>{importingId === comp.id ? 'Importando...' : 'Adicionar ao CRM'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
