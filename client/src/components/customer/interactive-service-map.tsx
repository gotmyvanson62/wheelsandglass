import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, 
  Navigation, 
  Clock,
  CheckCircle2,
  Phone,
  Calendar,
  FileText
} from 'lucide-react';

interface InteractiveServiceMapProps {
  onRequestQuote: () => void;
}

interface ServiceLocation {
  state: string;
  cities: {
    name: string;
    zipCodes: string[];
    driveTime: string;
    serviceType: 'full' | 'limited';
    coordinates: { x: number; y: number }; // SVG coordinates
  }[];
  serviceLevel: 'primary' | 'extended' | 'limited';
}

const serviceLocations: ServiceLocation[] = [
  {
    state: 'California',
    serviceLevel: 'primary',
    cities: [
      {
        name: 'San Diego',
        zipCodes: ['92101', '92102', '92103', '92104', '92105', '92106', '92107', '92108', '92109', '92110', '92111', '92113', '92114', '92115', '92116', '92117', '92119', '92120', '92121', '92122', '92123', '92124', '92126', '92127', '92128', '92129', '92130', '92131', '92132', '92134', '92135', '92136', '92139', '92140', '92154', '92155', '92158', '92159', '92161', '92162', '92163', '92165', '92166', '92167', '92168', '92169', '92170', '92171', '92172', '92173', '92174', '92175', '92176', '92177', '92178', '92179', '92182', '92186', '92187', '92190', '92191', '92192', '92193', '92194', '92195', '92196', '92197', '92198', '92199'],
        driveTime: '15-30 minutes',
        serviceType: 'full',
        coordinates: { x: 117, y: 372 }
      },
      {
        name: 'La Mesa',
        zipCodes: ['91941', '91942', '91943', '91944'],
        driveTime: '20-35 minutes',
        serviceType: 'full',
        coordinates: { x: 125, y: 368 }
      },
      {
        name: 'El Cajon',
        zipCodes: ['92019', '92020', '92021'],
        driveTime: '25-40 minutes',
        serviceType: 'full',
        coordinates: { x: 135, y: 365 }
      },
      {
        name: 'Chula Vista',
        zipCodes: ['91909', '91910', '91911', '91913', '91914', '91915'],
        driveTime: '20-35 minutes',
        serviceType: 'full',
        coordinates: { x: 120, y: 378 }
      },
      {
        name: 'National City',
        zipCodes: ['91950', '91951'],
        driveTime: '20-30 minutes',
        serviceType: 'full',
        coordinates: { x: 118, y: 375 }
      },
      {
        name: 'Coronado',
        zipCodes: ['92118'],
        driveTime: '25-40 minutes',
        serviceType: 'full',
        coordinates: { x: 115, y: 376 }
      },
      {
        name: 'Santee',
        zipCodes: ['92071'],
        driveTime: '30-45 minutes',
        serviceType: 'limited',
        coordinates: { x: 130, y: 360 }
      },
      {
        name: 'Poway',
        zipCodes: ['92064'],
        driveTime: '35-50 minutes',
        serviceType: 'limited',
        coordinates: { x: 128, y: 355 }
      }
    ]
  }
];

export function InteractiveServiceMap({ onRequestQuote }: InteractiveServiceMapProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const getStateColor = (stateName: string) => {
    const location = serviceLocations.find(loc => loc.state === stateName);
    if (!location) return '#e5e7eb'; // gray-200 for no service
    
    if (location.serviceLevel === 'primary') return '#10b981'; // green-500
    if (location.serviceLevel === 'extended') return '#3b82f6'; // blue-500
    return '#6b7280'; // gray-500 for limited
  };

  const getStateOpacity = (stateName: string) => {
    if (hoveredState === stateName) return 0.8;
    const location = serviceLocations.find(loc => loc.state === stateName);
    return location ? 0.6 : 0.3;
  };

  const handleStateClick = (stateName: string) => {
    const location = serviceLocations.find(loc => loc.state === stateName);
    if (location) {
      setSelectedState(stateName);
      setSelectedCity(null);
    }
  };

  const handleCityClick = (city: any) => {
    setSelectedCity(city);
  };

  const handleScheduleService = () => {
    onRequestQuote();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Service Coverage Map
              </CardTitle>
              <p className="text-sm text-gray-600">Click on a state to see available cities and service areas</p>
            </CardHeader>
            <CardContent>
              <div className="relative w-full" style={{ paddingBottom: '60%' }}>
                <svg 
                  viewBox="0 0 800 500" 
                  className="absolute inset-0 w-full h-full border rounded-lg bg-gray-50"
                  style={{ maxWidth: '100%', height: 'auto' }}
                >
                  {/* Simplified US Map - California highlighted as primary service area */}
                  
                  {/* California */}
                  <path
                    d="M 50 300 L 50 450 L 200 450 L 180 300 Z"
                    fill={getStateColor('California')}
                    fillOpacity={getStateOpacity('California')}
                    stroke="#374151"
                    strokeWidth="1"
                    className="cursor-pointer transition-all duration-200 hover:stroke-2"
                    onClick={() => handleStateClick('California')}
                    onMouseEnter={() => setHoveredState('California')}
                    onMouseLeave={() => setHoveredState(null)}
                  />
                  <text x="125" y="375" textAnchor="middle" className="text-xs font-medium fill-current pointer-events-none">
                    CA
                  </text>
                  
                  {/* Other Western States - Limited/No Service */}
                  <path
                    d="M 200 300 L 200 450 L 300 450 L 300 300 Z"
                    fill="#e5e7eb"
                    fillOpacity="0.3"
                    stroke="#374151"
                    strokeWidth="1"
                    className="cursor-pointer"
                    onClick={() => {}}
                  />
                  <text x="250" y="375" textAnchor="middle" className="text-xs font-medium fill-gray-400 pointer-events-none">
                    NV
                  </text>
                  
                  <path
                    d="M 300 250 L 300 450 L 400 450 L 400 250 Z"
                    fill="#e5e7eb"
                    fillOpacity="0.3"
                    stroke="#374151"
                    strokeWidth="1"
                    className="cursor-pointer"
                  />
                  <text x="350" y="350" textAnchor="middle" className="text-xs font-medium fill-gray-400 pointer-events-none">
                    UT
                  </text>
                  
                  {/* Texas */}
                  <path
                    d="M 400 350 L 400 450 L 550 450 L 550 350 Z"
                    fill="#e5e7eb"
                    fillOpacity="0.3"
                    stroke="#374151"
                    strokeWidth="1"
                    className="cursor-pointer"
                  />
                  <text x="475" y="400" textAnchor="middle" className="text-xs font-medium fill-gray-400 pointer-events-none">
                    TX
                  </text>
                  
                  {/* Florida */}
                  <path
                    d="M 650 380 L 650 430 L 750 430 L 750 380 Z"
                    fill="#e5e7eb"
                    fillOpacity="0.3"
                    stroke="#374151"
                    strokeWidth="1"
                    className="cursor-pointer"
                  />
                  <text x="700" y="405" textAnchor="middle" className="text-xs font-medium fill-gray-400 pointer-events-none">
                    FL
                  </text>
                  
                  {/* Other states represented as simplified shapes */}
                  <path
                    d="M 400 200 L 400 350 L 600 350 L 600 200 Z"
                    fill="#e5e7eb"
                    fillOpacity="0.3"
                    stroke="#374151"
                    strokeWidth="1"
                    className="cursor-pointer"
                  />
                  <text x="500" y="275" textAnchor="middle" className="text-xs font-medium fill-gray-400 pointer-events-none">
                    Midwest
                  </text>
                  
                  <path
                    d="M 600 200 L 600 350 L 750 350 L 750 200 Z"
                    fill="#e5e7eb"
                    fillOpacity="0.3"
                    stroke="#374151"
                    strokeWidth="1"
                    className="cursor-pointer"
                  />
                  <text x="675" y="275" textAnchor="middle" className="text-xs font-medium fill-gray-400 pointer-events-none">
                    East Coast
                  </text>
                  
                  {/* City markers for California when selected */}
                  {selectedState === 'California' && serviceLocations.find(loc => loc.state === 'California')?.cities.map((city, index) => (
                    <g key={index}>
                      <circle
                        cx={city.coordinates.x}
                        cy={city.coordinates.y}
                        r="4"
                        fill={city.serviceType === 'full' ? '#10b981' : '#3b82f6'}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-200 hover:r-6"
                        onClick={() => handleCityClick(city)}
                      />
                      <text 
                        x={city.coordinates.x} 
                        y={city.coordinates.y - 8} 
                        textAnchor="middle" 
                        className="text-xs font-medium fill-current pointer-events-none"
                      >
                        {city.name}
                      </text>
                    </g>
                  ))}
                  
                  {/* Legend */}
                  <g transform="translate(20, 20)">
                    <rect x="0" y="0" width="200" height="80" fill="white" fillOpacity="0.9" stroke="#d1d5db" rx="4"/>
                    <text x="10" y="15" className="text-xs font-bold fill-current">Service Coverage</text>
                    
                    <circle cx="20" cy="30" r="4" fill="#10b981"/>
                    <text x="30" y="34" className="text-xs fill-current">Primary Service Area</text>
                    
                    <circle cx="20" cy="45" r="4" fill="#3b82f6"/>
                    <text x="30" y="49" className="text-xs fill-current">Extended Service Area</text>
                    
                    <circle cx="20" cy="60" r="4" fill="#e5e7eb"/>
                    <text x="30" y="64" className="text-xs fill-current">Future Expansion</text>
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          {!selectedState && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select a Service Area</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Click on a state to view available cities and service options.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Primary Service Areas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Extended Service Areas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    <span className="text-sm">Future Expansion</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedState && !selectedCity && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  {selectedState} Service Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Click on a city marker to view details and schedule service.
                </p>
                <div className="space-y-3">
                  {serviceLocations.find(loc => loc.state === selectedState)?.cities.map((city, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleCityClick(city)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium">{city.name}</h4>
                        <Badge 
                          variant="secondary"
                          className={city.serviceType === 'full' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
                        >
                          {city.serviceType === 'full' ? 'Full Service' : 'Limited Service'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-3 h-3" />
                        Response: {city.driveTime}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedCity && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  {selectedCity.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Response time: {selectedCity.driveTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary"
                      className={selectedCity.serviceType === 'full' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
                    >
                      {selectedCity.serviceType === 'full' ? 'Full Service Available' : 'Limited Service'}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    Serving zip codes: {selectedCity.zipCodes.slice(0, 6).join(', ')}
                    {selectedCity.zipCodes.length > 6 && ` +${selectedCity.zipCodes.length - 6} more`}
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <Button 
                    className="w-full"
                    onClick={handleScheduleService}
                    data-testid="button-schedule-service"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Get Quote & Schedule
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="tel:+1-800-EXPRESS" className="flex items-center justify-center gap-2">
                      <Phone className="w-3 h-3" />
                      Call for Immediate Service
                    </a>
                  </Button>
                </div>

                <div className="text-xs text-gray-500 pt-2 border-t">
                  <p className="mb-1">✓ Mobile service to your location</p>
                  <p className="mb-1">✓ Insurance claim assistance</p>
                  <p className="mb-1">✓ Same-day service available</p>
                  <p>✓ Professional installation guarantee</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}