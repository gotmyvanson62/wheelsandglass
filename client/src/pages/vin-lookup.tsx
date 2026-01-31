import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Search, Package, Clock, DollarSign, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface VehicleDetails {
  vin: string;
  year: number;
  make: string;
  model: string;
  bodyType?: string;
  engine?: string;
  trim?: string;
  isValid: boolean;
  source: 'omega_edi' | 'nhtsa' | 'manual';
}

interface NagsPartOption {
  nagsNumber: string;
  description: string;
  glassType: 'windshield' | 'side_window' | 'rear_glass' | 'quarter_glass';
  position?: string;
  partType: 'OEM' | 'aftermarket' | 'OEE';
  manufacturer?: string;
  price: number;
  availability: 'in_stock' | 'order_required' | 'unavailable';
  leadTime: number;
  supplierInfo?: any;
}

interface GlassSelectionOptions {
  windshield?: NagsPartOption[];
  sideWindows?: NagsPartOption[];
  rearGlass?: NagsPartOption[];
  quarterGlass?: NagsPartOption[];
}

export default function VinLookupPage() {
  const [vin, setVin] = useState("");
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(null);
  const [glassOptions, setGlassOptions] = useState<GlassSelectionOptions | null>(null);
  const [selectedPart, setSelectedPart] = useState<NagsPartOption | null>(null);

  // VIN Lookup mutation
  const vinLookupMutation = useMutation({
    mutationFn: async (vinNumber: string) => {
      const response = await apiRequest(`/api/vin/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin: vinNumber })
      });
      return response.json();
    },
    onSuccess: (data: VehicleDetails) => {
      setVehicleDetails(data);
      if (data.isValid) {
        // Automatically lookup NAGS parts if VIN is valid
        nagsLookupMutation.mutate(data.vin);
      }
    }
  });

  // NAGS Parts lookup mutation
  const nagsLookupMutation = useMutation({
    mutationFn: async (vinNumber: string) => {
      const response = await apiRequest(`/api/nags/parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin: vinNumber })
      });
      return response.json();
    },
    onSuccess: (data: GlassSelectionOptions) => {
      setGlassOptions(data);
    }
  });

  // Get subcontractors
  const { data: subcontractors } = useQuery({
    queryKey: ['/api/subcontractors'],
    enabled: !!selectedPart
  });

  const handleVinLookup = () => {
    if (vin.length === 17) {
      vinLookupMutation.mutate(vin.toUpperCase());
    }
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const getAvailabilityBadge = (availability: string) => {
    const variants = {
      'in_stock': 'default',
      'order_required': 'secondary',
      'unavailable': 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[availability as keyof typeof variants] || 'secondary'}>
        {availability.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getGlassTypeIcon = (glassType: string) => {
    return <Car className="h-4 w-4" />;
  };

  const renderPartsSection = (title: string, parts: NagsPartOption[] | undefined, icon: React.ReactNode) => {
    if (!parts || parts.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>
        <div className="grid gap-3">
          {parts.map((part, index) => (
            <Card key={index} className={`cursor-pointer transition-all ${selectedPart?.nagsNumber === part.nagsNumber ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`} 
                  onClick={() => setSelectedPart(part)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{part.nagsNumber}</Badge>
                      <Badge>{part.partType}</Badge>
                      {getAvailabilityBadge(part.availability)}
                    </div>
                    <p className="text-sm text-gray-600">{part.description}</p>
                    {part.manufacturer && (
                      <p className="text-xs text-gray-500">Manufacturer: {part.manufacturer}</p>
                    )}
                    {part.position && (
                      <p className="text-xs text-gray-500">Position: {part.position}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      {formatPrice(part.price)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {part.leadTime} days
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Search className="h-6 w-6" />
        <h1 className="text-2xl font-bold">VIN Lookup & NAGS Parts</h1>
      </div>

      {/* VIN Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Identification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="vin">VIN Number (17 characters)</Label>
              <Input
                id="vin"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="Enter 17-character VIN..."
                maxLength={17}
                className="font-mono"
              />
            </div>
            <Button 
              onClick={handleVinLookup}
              disabled={vin.length !== 17 || vinLookupMutation.isPending}
              className="self-end"
            >
              {vinLookupMutation.isPending ? "Looking up..." : "Lookup VIN"}
            </Button>
          </div>
          
          {vin.length > 0 && vin.length !== 17 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                VIN must be exactly 17 characters long. Currently: {vin.length}/17
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Details Section */}
      {vehicleDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Details
              {vehicleDetails.isValid ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Valid
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Invalid
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Year</Label>
                <p className="text-lg font-semibold">{vehicleDetails.year || 'Unknown'}</p>
              </div>
              <div>
                <Label>Make</Label>
                <p className="text-lg font-semibold">{vehicleDetails.make || 'Unknown'}</p>
              </div>
              <div>
                <Label>Model</Label>
                <p className="text-lg font-semibold">{vehicleDetails.model || 'Unknown'}</p>
              </div>
              <div>
                <Label>Source</Label>
                <Badge variant="outline">{vehicleDetails.source.toUpperCase()}</Badge>
              </div>
            </div>
            {vehicleDetails.bodyType && (
              <div className="mt-4">
                <Label>Body Type</Label>
                <p className="text-sm">{vehicleDetails.bodyType}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* NAGS Parts Section */}
      {glassOptions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Available Glass Parts (NAGS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="windshield" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="windshield">Windshield</TabsTrigger>
                <TabsTrigger value="side">Side Windows</TabsTrigger>
                <TabsTrigger value="rear">Rear Glass</TabsTrigger>
                <TabsTrigger value="quarter">Quarter Glass</TabsTrigger>
              </TabsList>
              
              <TabsContent value="windshield" className="space-y-4">
                {renderPartsSection("Windshield Options", glassOptions.windshield, <Car className="h-4 w-4" />)}
              </TabsContent>
              
              <TabsContent value="side" className="space-y-4">
                {renderPartsSection("Side Window Options", glassOptions.sideWindows, <Car className="h-4 w-4" />)}
              </TabsContent>
              
              <TabsContent value="rear" className="space-y-4">
                {renderPartsSection("Rear Glass Options", glassOptions.rearGlass, <Car className="h-4 w-4" />)}
              </TabsContent>
              
              <TabsContent value="quarter" className="space-y-4">
                {renderPartsSection("Quarter Glass Options", glassOptions.quarterGlass, <Car className="h-4 w-4" />)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Selected Part Details */}
      {selectedPart && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Selected Part Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>NAGS Number</Label>
                  <p className="text-lg font-mono">{selectedPart.nagsNumber}</p>
                </div>
                <div>
                  <Label>Description</Label>
                  <p>{selectedPart.description}</p>
                </div>
                <div>
                  <Label>Type & Category</Label>
                  <div className="flex gap-2">
                    <Badge>{selectedPart.partType}</Badge>
                    <Badge variant="outline">{selectedPart.glassType.replace('_', ' ')}</Badge>
                  </div>
                </div>
                {selectedPart.manufacturer && (
                  <div>
                    <Label>Manufacturer</Label>
                    <p>{selectedPart.manufacturer}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Price</Label>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(selectedPart.price)}</p>
                </div>
                <div>
                  <Label>Availability</Label>
                  {getAvailabilityBadge(selectedPart.availability)}
                </div>
                <div>
                  <Label>Lead Time</Label>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedPart.leadTime} days
                  </div>
                </div>
                <Button className="w-full" size="lg">
                  <MapPin className="h-4 w-4 mr-2" />
                  Schedule Installation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Subcontractors */}
      {subcontractors && subcontractors.length > 0 && selectedPart && (
        <Card>
          <CardHeader>
            <CardTitle>Available Installers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {subcontractors.map((contractor: any) => (
                <div key={contractor.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{contractor.name}</h3>
                    <p className="text-sm text-gray-600">{contractor.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">Rating: {contractor.rating}/5</Badge>
                      <Badge variant="secondary">{contractor.specialties?.length || 0} specialties</Badge>
                    </div>
                  </div>
                  <Button size="sm">
                    Request Quote
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading States */}
      {vinLookupMutation.isPending && (
        <Alert>
          <AlertDescription>Looking up VIN in Omega EDI and NHTSA databases...</AlertDescription>
        </Alert>
      )}
      
      {nagsLookupMutation.isPending && (
        <Alert>
          <AlertDescription>Finding compatible glass parts via NAGS database...</AlertDescription>
        </Alert>
      )}

      {/* Error States */}
      {vinLookupMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            VIN lookup failed: {vinLookupMutation.error?.message || 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}
      
      {nagsLookupMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            NAGS parts lookup failed: {nagsLookupMutation.error?.message || 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}