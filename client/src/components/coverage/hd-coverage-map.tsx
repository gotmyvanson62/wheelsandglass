import { useState, useCallback, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Users,
  Building,
  ArrowLeft,
  ChevronRight,
  Phone,
  Clock,
  Wrench,
  Mail,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { TechnicianMessagePanel } from './technician-message-panel';
import { statesData, TechnicianInfo, CityData, StateData } from '@/data/technicians-by-state';

// US Atlas TopoJSON URL
const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

// State FIPS codes mapping
const stateFipsToAbbr: Record<string, string> = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
  '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
  '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
  '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
  '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
  '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
  '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
  '56': 'WY', '72': 'PR',
};

// Coverage color scheme (matching public customer map)
const coverageColors = {
  full: { fill: '#60a5fa', hover: '#3b82f6', stroke: '#374151' },      // Light blue (available)
  partial: { fill: '#60a5fa', hover: '#3b82f6', stroke: '#374151' },   // Light blue (available)
  limited: { fill: '#60a5fa', hover: '#3b82f6', stroke: '#374151' },   // Light blue (available)
  expanding: { fill: '#60a5fa', hover: '#3b82f6', stroke: '#374151' }, // Light blue (available)
};

// Colors for states not in the system
const unavailableColor = { fill: '#f3f4f6', hover: '#e5e7eb', stroke: '#374151' };

interface HDCoverageMapProps {
  className?: string;
  showSummaryCards?: boolean;
}

export function HDCoverageMap({ className, showSummaryCards = false }: HDCoverageMapProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [-96, 38],
    zoom: 1,
  });
  const [tooltipContent, setTooltipContent] = useState<{ x: number; y: number; state: string } | null>(null);
  const [messagingTechnician, setMessagingTechnician] = useState<(TechnicianInfo & { city: string }) | null>(null);

  // Calculate totals
  const totalStats = useMemo(() => {
    return Object.values(statesData).reduce(
      (acc, state) => ({
        states: acc.states + 1,
        cities: acc.cities + state.stats.cities,
        technicians: acc.technicians + state.stats.technicians,
        zipCodes: acc.zipCodes + state.stats.zipCodes,
      }),
      { states: 0, cities: 0, technicians: 0, zipCodes: 0 }
    );
  }, []);

  // Aggregate all technicians from all cities in the selected state
  const allStateTechnicians = useMemo(() => {
    if (!selectedState || !statesData[selectedState]) return [];

    const techList: Array<TechnicianInfo & { city: string; cityCoordinates: [number, number] }> = [];

    statesData[selectedState].cities.forEach((city) => {
      if (city.technicianList) {
        city.technicianList.forEach((tech) => {
          techList.push({
            ...tech,
            city: city.name,
            cityCoordinates: city.coordinates,
          });
        });
      }
    });

    // Sort by status: available first, then busy, then offline
    const statusOrder = { available: 0, busy: 1, offline: 2 };
    return techList.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }, [selectedState]);

  const handleStateClick = useCallback((abbr: string) => {
    const stateData = statesData[abbr];
    if (stateData) {
      setSelectedState(abbr);
      setPosition({
        coordinates: stateData.center,
        zoom: 4,
      });
    }
  }, []);

  const handleBackClick = useCallback(() => {
    if (selectedCity) {
      setSelectedCity(null);
    } else {
      setSelectedState(null);
      setPosition({
        coordinates: [-96, 38],
        zoom: 1,
      });
    }
  }, [selectedCity]);

  const handleCityClick = useCallback((city: CityData) => {
    setSelectedCity(city);
  }, []);

  const handleMoveEnd = useCallback((pos: { coordinates: [number, number]; zoom: number }) => {
    setPosition(pos);
  }, []);

  const handleMessageTechnician = useCallback((tech: TechnicianInfo & { city: string }) => {
    setMessagingTechnician(tech);
  }, []);

  const getStateAbbr = (geo: any): string | null => {
    const fips = geo.id;
    return stateFipsToAbbr[fips] || null;
  };

  const getCoverageColor = (abbr: string | null, isHovered: boolean) => {
    if (!abbr || !statesData[abbr]) {
      // States not in the system show as gray (coming soon)
      return isHovered ? { ...unavailableColor, fill: unavailableColor.hover } : unavailableColor;
    }
    const colors = coverageColors.full; // All covered states use same blue color
    return isHovered ? { ...colors, fill: colors.hover } : colors;
  };

  const selectedStateData = selectedState ? statesData[selectedState] : null;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Service Coverage
          </CardTitle>
          {(selectedState || selectedCity) && (
            <Button variant="outline" size="sm" onClick={handleBackClick}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {selectedCity ? `Back to ${selectedStateData?.name}` : 'Back to US'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats - only show if not drilled down and showSummaryCards is true */}
        {!selectedState && showSummaryCards && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-600">{totalStats.states}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">States</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-600">{totalStats.cities}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Cities</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-purple-600">{totalStats.technicians.toLocaleString()}+</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Technicians</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-orange-600">{(totalStats.zipCodes / 1000).toFixed(0)}K+</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">ZIP Codes</div>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Map */}
          <div className="relative flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
            <ComposableMap
              projection="geoAlbersUsa"
              projectionConfig={{
                scale: 1000,
              }}
              style={{ width: '100%', height: '100%' }}
            >
              <ZoomableGroup
                center={position.coordinates}
                zoom={position.zoom}
                onMoveEnd={handleMoveEnd}
                minZoom={1}
                maxZoom={8}
              >
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const abbr = getStateAbbr(geo);
                      const isHovered = hoveredState === abbr;
                      const isSelected = selectedState === abbr;
                      const colors = getCoverageColor(abbr, isHovered || isSelected);

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={colors.fill}
                          stroke={colors.stroke}
                          strokeWidth={isSelected ? 2 : 0.5}
                          style={{
                            default: { outline: 'none' },
                            hover: { outline: 'none', cursor: 'pointer' },
                            pressed: { outline: 'none' },
                          }}
                          onMouseEnter={(e) => {
                            if (abbr) {
                              setHoveredState(abbr);
                              const rect = (e.target as SVGElement).getBoundingClientRect();
                              setTooltipContent({
                                x: rect.left + rect.width / 2,
                                y: rect.top,
                                state: abbr,
                              });
                            }
                          }}
                          onMouseLeave={() => {
                            setHoveredState(null);
                            setTooltipContent(null);
                          }}
                          onClick={() => abbr && handleStateClick(abbr)}
                        />
                      );
                    })
                  }
                </Geographies>

                {/* City markers when zoomed into a state */}
                {selectedStateData && position.zoom >= 3 &&
                  selectedStateData.cities.map((city) => (
                    <Marker key={city.name} coordinates={city.coordinates}>
                      <g onClick={() => handleCityClick(city)} style={{ cursor: 'pointer' }}>
                        <circle
                          r={Math.max(4, city.technicians / 10)}
                          fill={selectedCity?.name === city.name ? '#1f2937' : coverageColors[city.coverage].fill}
                          stroke={selectedCity?.name === city.name ? coverageColors[city.coverage].fill : '#fff'}
                          strokeWidth={selectedCity?.name === city.name ? 3 : 1.5}
                          className="transition-all duration-200 hover:opacity-80"
                        />
                        <text
                          textAnchor="middle"
                          y={-12}
                          style={{
                            fontSize: selectedCity?.name === city.name ? '10px' : '8px',
                            fill: selectedCity?.name === city.name ? '#1f2937' : '#374151',
                            fontWeight: selectedCity?.name === city.name ? 700 : 500,
                          }}
                        >
                          {city.name}
                        </text>
                      </g>
                    </Marker>
                  ))}
              </ZoomableGroup>
            </ComposableMap>

            {/* Hover Tooltip */}
            {tooltipContent && statesData[tooltipContent.state] && (
              <div
                className="fixed z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 pointer-events-none transform -translate-x-1/2 -translate-y-full"
                style={{
                  left: tooltipContent.x,
                  top: tooltipContent.y - 10,
                }}
              >
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {statesData[tooltipContent.state].name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {statesData[tooltipContent.state].stats.cities} cities • {statesData[tooltipContent.state].stats.technicians} technicians
                </div>
                <Badge
                  className="mt-1"
                  variant="outline"
                  style={{
                    borderColor: coverageColors[statesData[tooltipContent.state].coverage].fill,
                    color: coverageColors[statesData[tooltipContent.state].coverage].fill,
                  }}
                >
                  {statesData[tooltipContent.state].coverage} coverage
                </Badge>
              </div>
            )}
          </div>

          {/* State Detail Panel */}
          {selectedStateData && (
            <div className="lg:w-80 bg-white dark:bg-gray-800 rounded-lg border p-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {selectedStateData.name}
                </h3>
                <Badge
                  className="mt-1"
                  style={{
                    backgroundColor: coverageColors[selectedStateData.coverage].fill,
                    color: 'white',
                  }}
                >
                  {selectedStateData.coverage.charAt(0).toUpperCase() + selectedStateData.coverage.slice(1)} Coverage
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <Building className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <div className="text-lg font-bold">{selectedStateData.stats.cities}</div>
                  <div className="text-xs text-gray-500">Cities</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <Users className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                  <div className="text-lg font-bold">{selectedStateData.stats.technicians}</div>
                  <div className="text-xs text-gray-500">Technicians</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <MapPin className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                  <div className="text-lg font-bold">{selectedStateData.stats.zipCodes.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">ZIP Codes</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <div className="text-lg font-bold">{selectedStateData.stats.avgResponseTime}</div>
                  <div className="text-xs text-gray-500">Avg Response</div>
                </div>
              </div>

              {/* Top Cities or City Detail */}
              {selectedCity ? (
                <div className="space-y-4">
                  {/* City Header */}
                  <div className="border-b pb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: coverageColors[selectedCity.coverage].fill }}
                      />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{selectedCity.name}</h4>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {selectedCity.technicians} Technicians
                      </span>
                      {selectedCity.avgResponseTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {selectedCity.avgResponseTime}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Available Services */}
                  {selectedCity.services && selectedCity.services.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Services Available</h5>
                      <div className="flex flex-wrap gap-1">
                        {selectedCity.services.map((service) => (
                          <Badge key={service} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ZIP Codes */}
                  {selectedCity.zipCodes && selectedCity.zipCodes.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Coverage Areas</h5>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {selectedCity.zipCodes.join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Technician List */}
                  {selectedCity.technicianList && selectedCity.technicianList.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Available Technicians</h5>
                      <div className="space-y-2">
                        {selectedCity.technicianList.map((tech) => (
                          <div
                            key={tech.name}
                            className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{tech.name}</div>
                                <div className="text-xs text-gray-500">{tech.specialty}</div>
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  tech.status === 'available'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : tech.status === 'busy'
                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    : 'bg-gray-50 text-gray-500 border-gray-200'
                                }`}
                              >
                                {tech.status.charAt(0).toUpperCase() + tech.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 text-xs border-green-500 text-green-600 hover:bg-green-50"
                                onClick={() => handleMessageTechnician({ ...tech, city: selectedCity.name })}
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Message
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                                <Phone className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* City Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" size="sm">
                      <Wrench className="w-4 h-4 mr-2" />
                      Request Service
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Service Cities */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Service Cities</h4>
                    <p className="text-xs text-gray-500 mb-2">Click a city for details</p>
                    <div className="space-y-2">
                      {selectedStateData.cities.map((city) => (
                        <div
                          key={city.name}
                          onClick={() => handleCityClick(city)}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: coverageColors[city.coverage].fill }}
                            />
                            <span className="text-sm font-medium">{city.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Users className="w-3 h-3" />
                            {city.technicians}
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* All State Technicians */}
                  {allStateTechnicians.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                        All Technicians ({allStateTechnicians.length})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {allStateTechnicians.map((tech, index) => (
                          <div
                            key={`${tech.name}-${index}`}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {tech.name}
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`text-xs flex-shrink-0 ${
                                    tech.status === 'available'
                                      ? 'bg-green-50 text-green-700 border-green-200'
                                      : tech.status === 'busy'
                                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                      : 'bg-gray-100 text-gray-500 border-gray-200'
                                  }`}
                                >
                                  {tech.status.charAt(0).toUpperCase() + tech.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {tech.specialty} • {tech.city}
                              </div>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs border-green-500 text-green-600 hover:bg-green-50"
                                onClick={() => handleMessageTechnician(tech)}
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Message
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Phone className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-8 text-sm pt-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-400 border border-gray-700"></div>
            <span className="text-gray-600 dark:text-gray-400">Service Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gray-100 border border-gray-700"></div>
            <span className="text-gray-600 dark:text-gray-400">Coming Soon</span>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Click on any state to view detailed coverage and city information
        </p>
      </CardContent>

      {/* Technician Messaging Panel */}
      {messagingTechnician && (
        <TechnicianMessagePanel
          technician={messagingTechnician}
          onClose={() => setMessagingTechnician(null)}
        />
      )}
    </Card>
  );
}
