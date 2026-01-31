import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Users, Building, ArrowLeft, X } from 'lucide-react';

interface StateData {
  name: string;
  abbr: string;
  cities: number;
  technicians: number;
  zipCodes: number;
  coverage: 'full' | 'partial' | 'limited' | 'none';
  topCities: string[];
}

const statesData: Record<string, StateData> = {
  CA: { name: 'California', abbr: 'CA', cities: 28, technicians: 245, zipCodes: 4200, coverage: 'full', topCities: ['Los Angeles', 'San Diego', 'San Francisco', 'San Jose', 'Sacramento'] },
  TX: { name: 'Texas', abbr: 'TX', cities: 22, technicians: 198, zipCodes: 3800, coverage: 'full', topCities: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'] },
  FL: { name: 'Florida', abbr: 'FL', cities: 18, technicians: 156, zipCodes: 2900, coverage: 'full', topCities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'] },
  AZ: { name: 'Arizona', abbr: 'AZ', cities: 12, technicians: 89, zipCodes: 1200, coverage: 'full', topCities: ['Phoenix', 'Tucson', 'Mesa', 'Scottsdale', 'Tempe'] },
  NV: { name: 'Nevada', abbr: 'NV', cities: 6, technicians: 42, zipCodes: 480, coverage: 'partial', topCities: ['Las Vegas', 'Reno', 'Henderson', 'North Las Vegas'] },
  CO: { name: 'Colorado', abbr: 'CO', cities: 8, technicians: 67, zipCodes: 720, coverage: 'partial', topCities: ['Denver', 'Colorado Springs', 'Aurora', 'Boulder'] },
  WA: { name: 'Washington', abbr: 'WA', cities: 10, technicians: 78, zipCodes: 890, coverage: 'partial', topCities: ['Seattle', 'Tacoma', 'Spokane', 'Bellevue'] },
  OR: { name: 'Oregon', abbr: 'OR', cities: 7, technicians: 52, zipCodes: 620, coverage: 'partial', topCities: ['Portland', 'Eugene', 'Salem', 'Bend'] },
  NY: { name: 'New York', abbr: 'NY', cities: 14, technicians: 112, zipCodes: 1800, coverage: 'partial', topCities: ['New York City', 'Buffalo', 'Rochester', 'Albany'] },
  IL: { name: 'Illinois', abbr: 'IL', cities: 9, technicians: 76, zipCodes: 980, coverage: 'partial', topCities: ['Chicago', 'Aurora', 'Naperville', 'Springfield'] },
  GA: { name: 'Georgia', abbr: 'GA', cities: 8, technicians: 64, zipCodes: 780, coverage: 'partial', topCities: ['Atlanta', 'Savannah', 'Augusta', 'Columbus'] },
  NC: { name: 'North Carolina', abbr: 'NC', cities: 7, technicians: 58, zipCodes: 720, coverage: 'partial', topCities: ['Charlotte', 'Raleigh', 'Durham', 'Greensboro'] },
  PA: { name: 'Pennsylvania', abbr: 'PA', cities: 8, technicians: 62, zipCodes: 840, coverage: 'limited', topCities: ['Philadelphia', 'Pittsburgh', 'Allentown'] },
  OH: { name: 'Ohio', abbr: 'OH', cities: 7, technicians: 54, zipCodes: 680, coverage: 'limited', topCities: ['Columbus', 'Cleveland', 'Cincinnati'] },
  MI: { name: 'Michigan', abbr: 'MI', cities: 6, technicians: 48, zipCodes: 620, coverage: 'limited', topCities: ['Detroit', 'Grand Rapids', 'Ann Arbor'] },
  NJ: { name: 'New Jersey', abbr: 'NJ', cities: 5, technicians: 42, zipCodes: 480, coverage: 'limited', topCities: ['Newark', 'Jersey City', 'Trenton'] },
  VA: { name: 'Virginia', abbr: 'VA', cities: 6, technicians: 46, zipCodes: 540, coverage: 'limited', topCities: ['Virginia Beach', 'Richmond', 'Norfolk'] },
  MA: { name: 'Massachusetts', abbr: 'MA', cities: 5, technicians: 38, zipCodes: 420, coverage: 'limited', topCities: ['Boston', 'Worcester', 'Cambridge'] },
  TN: { name: 'Tennessee', abbr: 'TN', cities: 5, technicians: 36, zipCodes: 380, coverage: 'limited', topCities: ['Nashville', 'Memphis', 'Knoxville'] },
  MO: { name: 'Missouri', abbr: 'MO', cities: 4, technicians: 32, zipCodes: 340, coverage: 'limited', topCities: ['Kansas City', 'St. Louis', 'Springfield'] },
};

// Simplified US Map SVG paths for each state
const statePaths: Record<string, string> = {
  WA: 'M125,55 L175,55 L180,45 L200,45 L200,95 L125,95 Z',
  OR: 'M125,95 L200,95 L200,145 L125,145 Z',
  CA: 'M125,145 L175,145 L190,220 L140,280 L100,260 L100,180 L125,145 Z',
  NV: 'M175,145 L225,145 L220,220 L190,220 Z',
  AZ: 'M190,220 L240,220 L250,280 L180,280 Z',
  ID: 'M200,55 L225,55 L230,145 L200,145 Z',
  MT: 'M225,55 L310,55 L310,95 L225,95 Z',
  WY: 'M225,95 L310,95 L310,145 L225,145 Z',
  UT: 'M225,145 L270,145 L270,200 L220,200 Z',
  CO: 'M270,145 L340,145 L340,200 L270,200 Z',
  NM: 'M250,200 L320,200 L320,280 L250,280 Z',
  ND: 'M310,55 L390,55 L390,85 L310,85 Z',
  SD: 'M310,85 L390,85 L390,120 L310,120 Z',
  NE: 'M310,120 L400,120 L400,155 L310,155 Z',
  KS: 'M340,155 L410,155 L410,195 L340,195 Z',
  OK: 'M340,195 L430,195 L430,235 L320,235 L320,210 L340,195 Z',
  TX: 'M320,235 L430,235 L450,320 L360,350 L280,320 L280,280 L320,235 Z',
  MN: 'M390,55 L440,55 L450,110 L390,110 Z',
  IA: 'M400,110 L460,110 L460,155 L400,155 Z',
  MO: 'M410,155 L470,155 L475,210 L410,210 Z',
  AR: 'M430,210 L480,210 L480,260 L430,260 Z',
  LA: 'M430,260 L490,260 L500,310 L450,310 L430,280 Z',
  WI: 'M450,55 L500,55 L505,110 L450,110 Z',
  IL: 'M470,110 L510,110 L510,180 L470,180 Z',
  MS: 'M480,210 L520,210 L520,280 L480,280 Z',
  MI: 'M500,55 L560,70 L550,120 L505,110 Z',
  IN: 'M510,110 L545,110 L545,170 L510,170 Z',
  KY: 'M510,170 L570,170 L570,200 L510,200 Z',
  TN: 'M510,200 L590,200 L590,230 L510,230 Z',
  AL: 'M520,230 L560,230 L565,290 L520,290 Z',
  OH: 'M545,110 L590,110 L590,165 L545,165 Z',
  WV: 'M570,165 L600,165 L600,195 L570,195 Z',
  VA: 'M570,195 L640,185 L640,210 L570,220 Z',
  NC: 'M570,220 L660,210 L660,240 L570,250 Z',
  SC: 'M590,250 L640,250 L645,290 L590,290 Z',
  GA: 'M560,250 L590,250 L600,310 L560,310 Z',
  FL: 'M560,310 L620,310 L640,380 L580,400 L550,350 Z',
  PA: 'M590,110 L650,105 L655,145 L590,150 Z',
  NY: 'M590,70 L680,55 L680,105 L590,110 Z',
  VT: 'M660,55 L680,55 L680,80 L660,80 Z',
  NH: 'M680,55 L695,55 L695,85 L680,85 Z',
  ME: 'M695,40 L720,30 L725,80 L695,85 Z',
  MA: 'M680,85 L720,80 L720,100 L680,100 Z',
  RI: 'M710,100 L720,100 L720,110 L710,110 Z',
  CT: 'M690,100 L710,100 L710,115 L690,115 Z',
  NJ: 'M655,115 L680,115 L680,150 L655,150 Z',
  DE: 'M660,150 L675,150 L675,170 L660,170 Z',
  MD: 'M640,170 L680,165 L680,185 L640,190 Z',
};

export function USCoverageMap() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getCoverageColor = (coverage: StateData['coverage'], isHovered: boolean, isSelected: boolean) => {
    const base = {
      full: { fill: '#22c55e', stroke: '#16a34a' },
      partial: { fill: '#3b82f6', stroke: '#2563eb' },
      limited: { fill: '#f59e0b', stroke: '#d97706' },
      none: { fill: '#e5e7eb', stroke: '#d1d5db' },
    };
    const colors = base[coverage];
    if (isSelected) return { fill: '#1e40af', stroke: '#1e3a8a' };
    if (isHovered) return { fill: colors.stroke, stroke: colors.stroke };
    return colors;
  };

  const handleStateClick = (abbr: string) => {
    if (statesData[abbr]) {
      setSelectedState(abbr);
      setDialogOpen(true);
    }
  };

  const totalStats = Object.values(statesData).reduce((acc, state) => ({
    states: acc.states + 1,
    cities: acc.cities + state.cities,
    technicians: acc.technicians + state.technicians,
    zipCodes: acc.zipCodes + state.zipCodes,
  }), { states: 0, cities: 0, technicians: 0, zipCodes: 0 });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Service Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalStats.states}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">States</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{totalStats.cities}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cities</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{totalStats.technicians.toLocaleString()}+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Technicians</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{(totalStats.zipCodes / 1000).toFixed(0)}K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">ZIP Codes</div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="relative">
            <svg
              viewBox="80 20 680 400"
              className="w-full h-auto"
              style={{ maxHeight: '400px' }}
            >
              {/* Background */}
              <rect x="80" y="20" width="680" height="400" fill="#f8fafc" className="dark:fill-gray-800" rx="8" />

              {/* State paths */}
              {Object.entries(statePaths).map(([abbr, path]) => {
                const stateData = statesData[abbr];
                const coverage = stateData?.coverage || 'none';
                const isHovered = hoveredState === abbr;
                const isSelected = selectedState === abbr;
                const colors = getCoverageColor(coverage, isHovered, isSelected);

                return (
                  <path
                    key={abbr}
                    d={path}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={isHovered || isSelected ? 2 : 1}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredState(abbr)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => handleStateClick(abbr)}
                  />
                );
              })}

              {/* State labels */}
              {Object.entries(statePaths).map(([abbr]) => {
                const stateData = statesData[abbr];
                if (!stateData) return null;

                // Calculate center of state (simplified)
                const pathMatch = statePaths[abbr].match(/M(\d+),(\d+)/);
                if (!pathMatch) return null;
                const x = parseInt(pathMatch[1]) + 25;
                const y = parseInt(pathMatch[2]) + 25;

                return (
                  <text
                    key={`label-${abbr}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    className="text-xs font-medium fill-white pointer-events-none select-none"
                    style={{ fontSize: '10px' }}
                  >
                    {abbr}
                  </text>
                );
              })}
            </svg>

            {/* Hover tooltip */}
            {hoveredState && statesData[hoveredState] && (
              <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 pointer-events-none z-10">
                <div className="font-semibold">{statesData[hoveredState].name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {statesData[hoveredState].cities} cities • {statesData[hoveredState].technicians} technicians
                </div>
                <Badge className="mt-1" variant="outline">
                  {statesData[hoveredState].coverage} coverage
                </Badge>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span>Full Coverage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span>Partial Coverage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500"></div>
              <span>Limited Coverage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-300"></div>
              <span>Expanding Soon</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            Click on any state to view detailed coverage information
          </p>
        </CardContent>
      </Card>

      {/* State Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {selectedState && statesData[selectedState]?.name} Coverage
            </DialogTitle>
          </DialogHeader>

          {selectedState && statesData[selectedState] && (
            <div className="space-y-6">
              {/* Coverage Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-center">
                  <Building className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">{statesData[selectedState].cities}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Cities</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-600">{statesData[selectedState].technicians}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Technicians</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4 text-center">
                  <MapPin className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold text-orange-600">{statesData[selectedState].zipCodes.toLocaleString()}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">ZIP Codes</div>
                </div>
              </div>

              {/* Coverage Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium">Coverage Status</span>
                <Badge className={
                  statesData[selectedState].coverage === 'full' ? 'bg-green-100 text-green-800' :
                  statesData[selectedState].coverage === 'partial' ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
                }>
                  {statesData[selectedState].coverage.charAt(0).toUpperCase() + statesData[selectedState].coverage.slice(1)} Coverage
                </Badge>
              </div>

              {/* Top Cities */}
              <div>
                <h4 className="font-medium mb-3">Top Service Cities</h4>
                <div className="flex flex-wrap gap-2">
                  {statesData[selectedState].topCities.map(city => (
                    <Badge key={city} variant="outline" className="py-1 px-3">
                      {city}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1" onClick={() => setDialogOpen(false)}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Find Technicians
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  View All Cities
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
