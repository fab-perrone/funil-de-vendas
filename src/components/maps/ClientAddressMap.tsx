import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, ExternalLink, Navigation, AlertCircle } from 'lucide-react';

interface ClientAddressMapProps {
  lat?: number;
  lng?: number;
  addressLabel: string;
  companyName: string;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

const MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  'AIzaSyBztM4xqbS3QiHatd0Ut2YnmcIv1bB1y88';

export const ClientAddressMap: React.FC<ClientAddressMapProps> = ({
  lat = -23.5505,
  lng = -46.6333,
  addressLabel,
  companyName,
  onCoordinatesChange,
  interactive = true,
}) => {
  const [currentPos, setCurrentPos] = useState({ lat, lng });
  const [loadError, setLoadError] = useState(false);

  // Sync if prop coords change
  React.useEffect(() => {
    if (lat && lng && (lat !== currentPos.lat || lng !== currentPos.lng)) {
      setCurrentPos({ lat, lng });
    }
  }, [lat, lng]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${companyName} ${addressLabel}`.trim() || `${currentPos.lat},${currentPos.lng}`
  )}`;

  return (
    <div className="w-full rounded-xl overflow-hidden border border-neutral-200 bg-white">
      {/* Map Header */}
      <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-neutral-800">{companyName || 'Localização no Mapa'}</span>
            <span className="text-neutral-500 block truncate max-w-xs md:max-w-md">
              {addressLabel || 'Avenida Paulista, São Paulo - SP'}
            </span>
          </div>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-md transition-colors shadow-2xs"
        >
          <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
          <span>Ver no Google Maps</span>
        </a>
      </div>

      {/* Map Viewport */}
      <div className="relative w-full h-64 bg-neutral-100">
        {!loadError ? (
          <APIProvider apiKey={MAPS_API_KEY} onLoad={() => setLoadError(false)}>
            <Map
              defaultCenter={currentPos}
              center={currentPos}
              defaultZoom={15}
              zoom={15}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              gestureHandling={interactive ? 'auto' : 'none'}
              disableDefaultUI={false}
              className="w-full h-full"
              onClick={(e) => {
                if (!interactive || !onCoordinatesChange) return;
                const newLat = e.detail?.latLng?.lat;
                const newLng = e.detail?.latLng?.lng;
                if (typeof newLat === 'number' && typeof newLng === 'number') {
                  setCurrentPos({ lat: newLat, lng: newLng });
                  onCoordinatesChange(newLat, newLng);
                }
              }}
            >
              <AdvancedMarker position={currentPos}>
                <Pin
                  background="#059669"
                  borderColor="#065f46"
                  glyphColor="#ffffff"
                  scale={1.1}
                />
              </AdvancedMarker>
            </Map>
          </APIProvider>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-neutral-600 bg-neutral-50">
            <AlertCircle className="w-8 h-8 text-neutral-400 mb-2" />
            <p className="text-xs font-medium text-neutral-800">Visualização de Endereço</p>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">{addressLabel}</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Abrir Rota no Google Maps</span>
            </a>
          </div>
        )}
      </div>

      {/* Map Footer Info */}
      <div className="px-4 py-2 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500 font-mono tabular-nums">
        <span>Lat: {currentPos.lat.toFixed(5)} · Lng: {currentPos.lng.toFixed(5)}</span>
        {interactive && onCoordinatesChange && (
          <span className="text-neutral-400 font-sans hidden sm:inline">
            Clique no mapa para refinar o local do cliente
          </span>
        )}
      </div>
    </div>
  );
};
