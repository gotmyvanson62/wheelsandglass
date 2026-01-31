import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Search, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Phone,
  Star,
  Car,
  Shield
} from 'lucide-react';
import { InteractiveUSMap } from '@/components/customer/interactive-us-map';

interface ServiceAreaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestQuote?: () => void;
}

interface ServiceArea {
  city: string;
  zipCodes: string[];
  driveTime: string;
  serviceType: 'full' | 'limited';
}

export function ServiceAreaDialog({ isOpen, onClose, onRequestQuote }: ServiceAreaDialogProps) {
  const { toast } = useToast();
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [searchResult, setSearchResult] = useState<{
    isServiceable: boolean;
    area?: ServiceArea;
    message: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Service areas data - this would typically come from an API
  const serviceAreas: ServiceArea[] = [
    {
      city: "San Diego",
      zipCodes: ["92101", "92102", "92103", "92104", "92105", "92106", "92107", "92108", "92109", "92110", "92111", "92113", "92114", "92115", "92116", "92117", "92119", "92120", "92121", "92122", "92123", "92124", "92126", "92127", "92128", "92129", "92130", "92131", "92132", "92134", "92135", "92136", "92139", "92140", "92154", "92155", "92158", "92159", "92161", "92162", "92163", "92165", "92166", "92167", "92168", "92169", "92170", "92171", "92172", "92173", "92174", "92175", "92176", "92177", "92178", "92179", "92182", "92186", "92187", "92190", "92191", "92192", "92193", "92194", "92195", "92196", "92197", "92198", "92199"],
      driveTime: "15-30 minutes",
      serviceType: "full"
    },
    {
      city: "La Mesa",
      zipCodes: ["91941", "91942", "91943", "91944"],
      driveTime: "20-35 minutes",
      serviceType: "full"
    },
    {
      city: "El Cajon", 
      zipCodes: ["92019", "92020", "92021"],
      driveTime: "25-40 minutes",
      serviceType: "full"
    },
    {
      city: "Chula Vista",
      zipCodes: ["91909", "91910", "91911", "91913", "91914", "91915"],
      driveTime: "20-35 minutes", 
      serviceType: "full"
    },
    {
      city: "National City",
      zipCodes: ["91950", "91951"],
      driveTime: "20-30 minutes",
      serviceType: "full"
    },
    {
      city: "Coronado",
      zipCodes: ["92118"],
      driveTime: "25-40 minutes",
      serviceType: "full"
    },
    {
      city: "Santee",
      zipCodes: ["92071"],
      driveTime: "30-45 minutes",
      serviceType: "limited"
    },
    {
      city: "Poway",
      zipCodes: ["92064"],
      driveTime: "35-50 minutes", 
      serviceType: "limited"
    }
  ];

  const handleSearch = async () => {
    if (!zipCode.trim() && !address.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a zip code or address to search",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    try {
      const searchTerm = zipCode.trim() || address.trim();
      let locationInfo: { city: string; state: string; zipCode: string } | null = null;
      
      // If searching by zip code, try to get location info
      if (zipCode.trim()) {
        try {
          // Use a free zip code API to get actual location data
          const response = await fetch(`https://api.zippopotam.us/us/${zipCode.trim()}`);
          if (response.ok) {
            const data = await response.json();
            locationInfo = {
              city: data.places?.[0]?.['place name'] || 'Unknown',
              state: data.places?.[0]?.['state'] || 'Unknown',
              zipCode: data['post code']
            };
          }
        } catch (error) {
          console.warn('Zip code lookup failed:', error);
        }
      }
      
      // Check if zip code matches any service area
      const matchingArea = serviceAreas.find(area => 
        area.zipCodes.some(zip => zip === zipCode.trim()) ||
        area.city.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (matchingArea) {
        setSearchResult({
          isServiceable: true,
          area: matchingArea,
          message: `Great news! We provide ${matchingArea.serviceType} service in ${matchingArea.city}.`
        });
      } else {
        // Check if it's a nearby area or provide location context
        const nearbyZipPattern = /^9[12]\d{3}$/; // San Diego county pattern
        
        if (locationInfo) {
          // We got real location data, provide context
          if (nearbyZipPattern.test(zipCode.trim())) {
            setSearchResult({
              isServiceable: true,
              message: `We may be able to service ${locationInfo.city}, ${locationInfo.state}. Please call for availability and pricing.`
            });
          } else {
            // Check if it's in California
            if (locationInfo.state.toLowerCase().includes('california') || locationInfo.state === 'CA') {
              setSearchResult({
                isServiceable: false,
                message: `We don't currently service ${locationInfo.city}, ${locationInfo.state}, but we're always expanding! Please call to discuss options.`
              });
            } else {
              setSearchResult({
                isServiceable: false,
                message: `We don't currently service ${locationInfo.city}, ${locationInfo.state}. Our primary service area is Southern California.`
              });
            }
          }
        } else if (nearbyZipPattern.test(zipCode.trim())) {
          setSearchResult({
            isServiceable: true,
            message: "We may be able to service your area. Please call for availability and pricing."
          });
        } else {
          setSearchResult({
            isServiceable: false,
            message: "Sorry, we don't currently service this area. We're always expanding though!"
          });
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResult({
        isServiceable: false,
        message: "Unable to check service area at this time. Please call us directly for assistance."
      });
    }

    setIsSearching(false);
  };

  const handleReset = () => {
    setZipCode('');
    setAddress('');
    setSearchResult(null);
  };

  const primaryAreas = serviceAreas.filter(area => area.serviceType === 'full');
  const extendedAreas = serviceAreas.filter(area => area.serviceType === 'limited');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Service Areas & Coverage
          </DialogTitle>
          <DialogDescription>
            Find out if we service your area and get estimated response times
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="coverage" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Check My Area</TabsTrigger>
            <TabsTrigger value="coverage">US Service Map</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Check Service Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="Enter your zip code (e.g., 92101)"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      maxLength={5}
                      data-testid="input-zip-code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Or Full Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter city or full address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      data-testid="input-address"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="flex items-center gap-2"
                    data-testid="button-search-area"
                  >
                    {isSearching ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    {isSearching ? 'Searching...' : 'Check Service Area'}
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    Clear
                  </Button>
                </div>

                {searchResult && (
                  <div className={`p-4 rounded-lg border ${
                    searchResult.isServiceable 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      {searchResult.isServiceable ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div className="space-y-2">
                        <p className={`font-medium ${
                          searchResult.isServiceable ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {searchResult.message}
                        </p>
                        
                        {searchResult.area && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-4 text-sm text-green-700">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Response: {searchResult.area.driveTime}
                              </span>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {searchResult.area.serviceType === 'full' ? 'Full Service' : 'Limited Service'}
                              </Badge>
                            </div>
                            
                            <div className="pt-2 border-t border-green-200">
                              <p className="text-sm text-green-700 mb-2">What's included:</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-600">
                                <div className="flex items-center gap-2">
                                  <Car className="w-4 h-4" />
                                  Mobile service to your location
                                </div>
                                <div className="flex items-center gap-2">
                                  <Shield className="w-4 h-4" />
                                  Insurance claim assistance
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Same-day service available
                                </div>
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4" />
                                  Professional installation
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-3 border-t border-green-200">
                          <Button 
                            size="sm" 
                            className="mr-2"
                            onClick={() => {
                              onClose();
                              onRequestQuote?.();
                            }}
                          >
                            Get Quote
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a href="tel:+1-800-EXPRESS" className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              Call Now
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coverage" className="space-y-4">
            <InteractiveUSMap 
              onRequestQuote={() => {
                onClose();
                onRequestQuote?.();
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}