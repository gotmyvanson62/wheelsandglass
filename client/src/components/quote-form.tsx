import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useVehicleLookup } from '@/hooks/use-vehicle-lookup';
import {
  SERVICE_LOCATIONS,
  WINDOW_TYPES,
  VEHICLE_YEARS,
  WHEEL_POSITIONS,
  getServiceTypesByDivision,
  type Division,
  type ServiceLocation
} from '@/data/locations';
import { getCoordinatesFromZip, calculateDistance } from '@/lib/zip-lookup';
import { apiClient, handleApiError } from '@/lib/api-client';
import { ClickableVehicleDiagram } from '@/components/clickable-vehicle-diagram';
import {
  Car,
  Upload,
  MapPin,
  Phone,
  Mail,
  Calendar,
  User,
  FileText,
  X,
  CheckCircle,
  Loader2,
  CircleDot
} from 'lucide-react';

interface QuoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  inline?: boolean; // When true, renders form without modal overlay
  division?: Division | null; // 'glass' or 'wheels' - determines service types and selection UI
}

export function QuoteForm({ isOpen, onClose, inline = false, division }: QuoteFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedWindows, setSelectedWindows] = useState<string[]>([]);
  const [selectedWheels, setSelectedWheels] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Internal division state - user selects if not provided via prop
  const [formDivision, setFormDivision] = useState<Division | null>(division || null);

  // Reset formDivision when the form opens/closes or division prop changes
  useEffect(() => {
    if (isOpen) {
      setFormDivision(division || null);
    }
  }, [isOpen, division]);

  // Determine if we need to show the division selector
  const showDivisionSelector = !formDivision;

  // Determine the effective division (default to 'glass' if somehow null during form rendering)
  const effectiveDivision: Division = formDivision || 'glass';
  const isWheelsDivision = effectiveDivision === 'wheels';

  // Get service types based on division
  const serviceTypes = getServiceTypesByDivision(effectiveDivision);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobilePhone: '',
    email: '',
    location: '',
    zipCode: '',
    serviceType: '',
    privacyTinted: '',
    year: '',
    make: '',
    model: '',
    vin: '',
    licensePlate: '',
    notes: ''
  });

  // For manual model entry when "Other" is selected
  const [customModel, setCustomModel] = useState('');

  // Filtered locations based on zip code proximity
  const [filteredLocations, setFilteredLocations] = useState<(ServiceLocation & { distance?: number })[]>(SERVICE_LOCATIONS);

  // Filter locations when zip code changes
  useEffect(() => {
    // If no zip or incomplete (less than 5 digits), show all locations sorted by state/city
    if (!formData.zipCode || formData.zipCode.length < 5) {
      const sorted = [...SERVICE_LOCATIONS]
        .filter(loc => loc.isActive)
        .sort((a, b) => {
          // Sort by state, then city
          const stateCompare = a.state.localeCompare(b.state);
          if (stateCompare !== 0) return stateCompare;
          return a.city.localeCompare(b.city);
        });
      setFilteredLocations(sorted);
      return;
    }

    // Get coordinates for entered zip code
    const userCoords = getCoordinatesFromZip(formData.zipCode);
    if (!userCoords) {
      // If zip not found in lookup, show all locations
      setFilteredLocations(SERVICE_LOCATIONS.filter(loc => loc.isActive));
      return;
    }

    // Calculate distance to each location and sort by proximity
    const locationsWithDistance = SERVICE_LOCATIONS
      .filter(loc => loc.isActive)
      .map(loc => ({
        ...loc,
        distance: calculateDistance(userCoords, loc.coordinates)
      }))
      .sort((a, b) => a.distance - b.distance);

    // Filter to only locations within service radius, or show all if none are within range
    const withinRadius = locationsWithDistance.filter(loc => loc.distance <= loc.serviceRadius);

    if (withinRadius.length > 0) {
      // Show locations within service radius (closest first)
      setFilteredLocations(withinRadius);
    } else {
      // No locations within radius - show closest 10 with distance info
      setFilteredLocations(locationsWithDistance.slice(0, 10));
    }

    // Clear location selection if previously selected location is no longer in filtered list
    if (formData.location) {
      const stillAvailable = locationsWithDistance.find(loc => loc.id === formData.location);
      if (stillAvailable && stillAvailable.distance > stillAvailable.serviceRadius) {
        // Selected location is outside service radius - let user keep it but they might want to change
      }
    }
  }, [formData.zipCode]);

  // NHTSA API-powered vehicle lookup
  const { makes, models, loadingMakes, loadingModels, errorMakes, errorModels } = useVehicleLookup(formData.year, formData.make);

  const handleWindowSelection = (window: string, checked: boolean) => {
    if (checked) {
      setSelectedWindows([...selectedWindows, window]);
    } else {
      setSelectedWindows(selectedWindows.filter(w => w !== window));
    }
  };

  const handleWheelSelection = (wheel: string, checked: boolean) => {
    if (checked) {
      setSelectedWheels([...selectedWheels, wheel]);
    } else {
      setSelectedWheels(selectedWheels.filter(w => w !== wheel));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 5 - uploadedFiles.length);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // [FORM] Strategic logging for end-to-end testing
    console.log('[FORM] Submitting quote request:', {
      division: effectiveDivision,
      email: formData.email,
      phone: formData.mobilePhone,
      vin: formData.vin,
      serviceType: formData.serviceType,
      windowCount: isWheelsDivision ? 0 : selectedWindows.length,
      wheelCount: isWheelsDivision ? selectedWheels.length : 0,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.mobilePhone ||
        !formData.email || !formData.location || !formData.serviceType) {
      console.log('[FORM] Validation failed: Missing required fields');
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields marked with *",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validate selection based on division
    if (isWheelsDivision) {
      if (selectedWheels.length === 0) {
        console.log('[FORM] Validation failed: No wheels selected');
        toast({
          title: "Missing Information",
          description: "Please select at least one wheel position",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    } else {
      if (selectedWindows.length === 0) {
        console.log('[FORM] Validation failed: No windows selected');
        toast({
          title: "Missing Information",
          description: "Please select at least one window/glass type",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    // Prepare submission data
    // Handle custom model entry when "Other" was selected
    const finalModel = formData.model === '_other' ? customModel : formData.model;
    const submitData = {
      ...formData,
      model: finalModel,
      division: effectiveDivision,
      selectedWindows: isWheelsDivision ? [] : selectedWindows,
      selectedWheels: isWheelsDivision ? selectedWheels : [],
      uploadedFiles: uploadedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
    };

    try {
      const response = await apiClient.post('/api/quote/submit', submitData);

      // [FORM] Log successful submission
      console.log('[FORM] Success:', {
        submissionId: response.data?.submissionId,
        customerId: response.data?.customerId,
        vinDecoded: response.data?.vinDecoded,
        timestamp: new Date().toISOString()
      });

      // Show success state AFTER API succeeds (not before)
      setSubmitSuccess(true);
      setIsSubmitting(false);

      toast({
        title: "Quote Request Submitted!",
        description: "We'll contact you within 24 hours with your personalized quote.",
      });

      // Close after delay to show success animation (with cleanup ref)
      closeTimeoutRef.current = setTimeout(() => {
        // Reset form
        setFormData({
          firstName: '', lastName: '', mobilePhone: '', email: '', location: '', zipCode: '',
          serviceType: '', privacyTinted: '', year: '', make: '', model: '', vin: '', licensePlate: '', notes: ''
        });
        setSelectedWindows([]);
        setSelectedWheels([]);
        setUploadedFiles([]);
        setCustomModel('');
        setSubmitSuccess(false);
        setFormDivision(division || null); // Reset to prop value or null
        onClose();
      }, 2000);
    } catch (error) {
      // [FORM] Log submission error
      console.log('[FORM] Error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      setIsSubmitting(false);
      toast({
        title: "Submission Error",
        description: handleApiError(error) + " Please try again.",
        variant: "destructive"
      });
      // Don't close, let user retry
    }
  };

  if (!isOpen) return null;

  // Division selector screen - shown when no division is pre-selected
  if (showDivisionSelector) {
    const divisionSelectorContent = (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-2xl">Request Quote</CardTitle>
              <p className="text-gray-300 mt-1 text-sm sm:text-base">First, tell us what service you need</p>
            </div>
            {!inline && (
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <p className="text-center text-gray-600 mb-6">Select the type of service you need:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Glass Division Card */}
            <button
              type="button"
              onClick={() => setFormDivision('glass')}
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Car className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Auto Glass</h3>
              <p className="text-sm text-gray-500">Windshield replacement, chip repair, ADAS calibration, window tinting</p>
            </button>

            {/* Wheels Division Card */}
            <button
              type="button"
              onClick={() => setFormDivision('wheels')}
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-left group"
            >
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                <CircleDot className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Wheel Repair</h3>
              <p className="text-sm text-gray-500">Curb rash repair, scratch repair, wheel refinishing, powder coating</p>
            </button>
          </div>
        </CardContent>
      </Card>
    );

    // Render based on inline mode
    if (inline) {
      return <div className="max-w-2xl mx-auto force-light">{divisionSelectorContent}</div>;
    }

    return (
      <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto force-light">
        <div className="min-h-screen px-2 sm:px-4 py-4 sm:py-8 flex items-center justify-center">
          {divisionSelectorContent}
        </div>
      </div>
    );
  }

  // Success screen with animation
  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 force-light">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center transform transition-all duration-500 animate-in zoom-in-95">
          <div className={`w-20 h-20 ${isWheelsDivision ? 'bg-orange-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300`}>
            <CheckCircle className={`w-12 h-12 ${isWheelsDivision ? 'text-orange-600' : 'text-green-600'}`} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {isWheelsDivision ? 'Wheel Repair Request Submitted!' : 'Quote Request Submitted!'}
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you, {formData.firstName}! We've received your {isWheelsDivision ? 'wheel repair' : 'quote'} request and will contact you within 24 hours with personalized pricing.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className={`w-2 h-2 ${isWheelsDivision ? 'bg-orange-500' : 'bg-green-500'} rounded-full animate-pulse`}></div>
            Processing your request...
          </div>
        </div>
      </div>
    );
  }

  // Form content to be rendered
  const formContent = (
    <Card>
      <CardHeader className={`${isWheelsDivision ? 'bg-gradient-to-r from-orange-500 to-amber-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'} text-white rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isWheelsDivision ? (
              <CircleDot className="w-8 h-8 text-white/90" />
            ) : (
              <Car className="w-8 h-8 text-white/90" />
            )}
            <div>
              <CardTitle className="text-lg sm:text-2xl">
                Request Quote
              </CardTitle>
              <p className={`${isWheelsDivision ? 'text-orange-100' : 'text-blue-100'} mt-1 text-sm sm:text-base`}>
                {isWheelsDivision
                  ? 'Complete the form below for wheel & rim repair pricing'
                  : 'Complete the form below for personalized pricing and scheduling'}
              </p>
            </div>
          </div>
          {!inline && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </CardHeader>

            <CardContent className="p-4 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Contact Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b pb-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Contact Information
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        data-testid="input-firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        data-testid="input-lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="mobilePhone">Mobile Phone *</Label>
                      <Input
                        id="mobilePhone"
                        data-testid="input-mobilePhone"
                        type="tel"
                        value={formData.mobilePhone}
                        onChange={(e) => setFormData({ ...formData, mobilePhone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        data-testid="input-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Service */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b pb-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Location & Service Type
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">Zip Code *</Label>
                      <Input
                        id="zipCode"
                        data-testid="input-zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        placeholder="e.g., 92101"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Service Location *</Label>
                      <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                        <SelectTrigger data-testid="select-location">
                          <SelectValue placeholder="Select your city" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {filteredLocations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.city}, {location.state}
                              {location.distance !== undefined && (
                                <span className="text-gray-500 text-xs ml-2">
                                  ({Math.round(location.distance)} mi)
                                </span>
                              )}
                            </SelectItem>
                          ))}
                          {filteredLocations.length === 0 && (
                            <div className="px-2 py-1.5 text-sm text-gray-500">
                              No service locations found
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      {formData.zipCode && formData.zipCode.length >= 5 && filteredLocations.length > 0 && filteredLocations[0].distance !== undefined && (
                        <p className="text-xs text-gray-500 mt-1">
                          Showing {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} nearest to {formData.zipCode}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="serviceType">Service Type *</Label>
                      <Select value={formData.serviceType} onValueChange={(value) => setFormData({ ...formData, serviceType: value })}>
                        <SelectTrigger data-testid="select-serviceType">
                          <SelectValue placeholder={isWheelsDivision ? "What wheel service do you need?" : "What do you need?"} />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b pb-2">
                    <Car className="w-5 h-5 text-blue-600" />
                    Vehicle Information
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Year Dropdown - Pre-populated */}
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Select
                        value={formData.year}
                        onValueChange={(value) => {
                          // Reset make and model when year changes
                          setFormData({ ...formData, year: value, make: '', model: '' });
                          setCustomModel('');
                        }}
                      >
                        <SelectTrigger data-testid="select-year">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {VEHICLE_YEARS.map((year) => (
                            <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Make Dropdown - API-powered */}
                    <div>
                      <Label htmlFor="make">Make</Label>
                      <Select
                        value={formData.make}
                        onValueChange={(value) => {
                          // Reset model when make changes
                          setFormData({ ...formData, make: value, model: '' });
                          setCustomModel('');
                        }}
                        disabled={!formData.year || loadingMakes}
                      >
                        <SelectTrigger data-testid="select-make">
                          {loadingMakes ? (
                            <span className="text-gray-400 flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading...
                            </span>
                          ) : (
                            <SelectValue placeholder={formData.year ? "Select make" : "Select year first"} />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {makes.map((make) => (
                            <SelectItem key={make.value} value={make.value}>{make.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errorMakes && (
                        <p className="text-xs text-amber-600 mt-1">{errorMakes}</p>
                      )}
                    </div>

                    {/* Model Dropdown - API-powered */}
                    <div>
                      <Label htmlFor="model">Model</Label>
                      {formData.model === '_other' ? (
                        <Input
                          id="model"
                          data-testid="input-model-custom"
                          value={customModel}
                          onChange={(e) => setCustomModel(e.target.value)}
                          placeholder="Enter model name"
                          className="mt-0"
                        />
                      ) : (
                        <Select
                          value={formData.model}
                          onValueChange={(value) => {
                            setFormData({ ...formData, model: value });
                            if (value !== '_other') {
                              setCustomModel('');
                            }
                          }}
                          disabled={!formData.make || loadingModels}
                        >
                          <SelectTrigger data-testid="select-model">
                            {loadingModels ? (
                              <span className="text-gray-400 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading...
                              </span>
                            ) : (
                              <SelectValue placeholder={formData.make ? "Select model" : "Select make first"} />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {models.map((model) => (
                              <SelectItem key={model.value} value={model.value}>{model.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {formData.model === '_other' && (
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="text-xs p-0 h-auto mt-1"
                          onClick={() => {
                            setFormData({ ...formData, model: '' });
                            setCustomModel('');
                          }}
                        >
                          ← Back to model list
                        </Button>
                      )}
                      {errorModels && formData.model !== '_other' && (
                        <p className="text-xs text-amber-600 mt-1">{errorModels}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vin">VIN *</Label>
                    <Input
                      id="vin"
                      data-testid="input-vin"
                      value={formData.vin}
                      onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                      placeholder="Vehicle Identification Number (17 characters)"
                      maxLength={17}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="licensePlate">License Plate (Optional)</Label>
                    <Input
                      id="licensePlate"
                      data-testid="input-licensePlate"
                      value={formData.licensePlate || ''}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                      placeholder="License plate number"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      License plate numbers can be used to look up vehicle information if VIN is not available
                    </p>
                  </div>
                </div>

                {/* Selection Section - Conditional based on division */}
                {isWheelsDivision ? (
                  /* Wheel Selection for Wheels Division */
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b pb-2">
                      <CircleDot className="w-5 h-5 text-orange-500" />
                      Select Wheels to Repair *
                    </div>

                    {/* Interactive Wheel Position Selector */}
                    <div className="my-4">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <p className="text-sm text-gray-600 mb-4 text-center">
                          Click the wheel positions that need repair
                        </p>
                        {/* Top-down car diagram with wheel positions */}
                        <div className="relative w-64 h-80 mx-auto">
                          {/* Car body silhouette */}
                          <div className="absolute inset-x-6 top-8 bottom-8 bg-gray-200 rounded-[40px] border-2 border-gray-300">
                            {/* Hood/Front */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-12 bg-gray-300 rounded-t-[20px]" />
                            {/* Trunk/Rear */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-10 bg-gray-300 rounded-b-[15px]" />
                          </div>

                          {/* Front Left Wheel */}
                          <button
                            type="button"
                            onClick={() => handleWheelSelection('front_left', !selectedWheels.includes('front_left'))}
                            className={`absolute top-12 left-0 w-12 h-16 rounded-lg border-2 transition-all flex flex-col items-center justify-center ${
                              selectedWheels.includes('front_left')
                                ? 'bg-orange-500 border-orange-600 text-white shadow-lg scale-105'
                                : 'bg-white border-gray-300 text-gray-600 hover:border-orange-400 hover:bg-orange-50'
                            }`}
                          >
                            <CircleDot className="w-6 h-6" />
                            <span className="text-[10px] font-semibold mt-1">FL</span>
                          </button>

                          {/* Front Right Wheel */}
                          <button
                            type="button"
                            onClick={() => handleWheelSelection('front_right', !selectedWheels.includes('front_right'))}
                            className={`absolute top-12 right-0 w-12 h-16 rounded-lg border-2 transition-all flex flex-col items-center justify-center ${
                              selectedWheels.includes('front_right')
                                ? 'bg-orange-500 border-orange-600 text-white shadow-lg scale-105'
                                : 'bg-white border-gray-300 text-gray-600 hover:border-orange-400 hover:bg-orange-50'
                            }`}
                          >
                            <CircleDot className="w-6 h-6" />
                            <span className="text-[10px] font-semibold mt-1">FR</span>
                          </button>

                          {/* Rear Left Wheel */}
                          <button
                            type="button"
                            onClick={() => handleWheelSelection('rear_left', !selectedWheels.includes('rear_left'))}
                            className={`absolute bottom-12 left-0 w-12 h-16 rounded-lg border-2 transition-all flex flex-col items-center justify-center ${
                              selectedWheels.includes('rear_left')
                                ? 'bg-orange-500 border-orange-600 text-white shadow-lg scale-105'
                                : 'bg-white border-gray-300 text-gray-600 hover:border-orange-400 hover:bg-orange-50'
                            }`}
                          >
                            <CircleDot className="w-6 h-6" />
                            <span className="text-[10px] font-semibold mt-1">RL</span>
                          </button>

                          {/* Rear Right Wheel */}
                          <button
                            type="button"
                            onClick={() => handleWheelSelection('rear_right', !selectedWheels.includes('rear_right'))}
                            className={`absolute bottom-12 right-0 w-12 h-16 rounded-lg border-2 transition-all flex flex-col items-center justify-center ${
                              selectedWheels.includes('rear_right')
                                ? 'bg-orange-500 border-orange-600 text-white shadow-lg scale-105'
                                : 'bg-white border-gray-300 text-gray-600 hover:border-orange-400 hover:bg-orange-50'
                            }`}
                          >
                            <CircleDot className="w-6 h-6" />
                            <span className="text-[10px] font-semibold mt-1">RR</span>
                          </button>

                          {/* Front indicator */}
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-500">
                            FRONT
                          </div>

                          {/* Rear indicator */}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-500">
                            REAR
                          </div>
                        </div>

                        {/* Selected wheels summary */}
                        {selectedWheels.length > 0 && (
                          <div className="mt-4 text-center">
                            <p className="text-sm font-medium text-gray-700">
                              Selected: {selectedWheels.map(w => WHEEL_POSITIONS.find(p => p.value === w)?.label).join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Wheel Position Checkboxes (Alternative/Accessible Selection) */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">Or select wheel positions:</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {WHEEL_POSITIONS.map((position) => (
                          <div key={position.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={position.value}
                              data-testid={`checkbox-${position.value}`}
                              checked={selectedWheels.includes(position.value)}
                              onCheckedChange={(checked) => handleWheelSelection(position.value, !!checked)}
                            />
                            <Label htmlFor={position.value} className="text-sm font-normal cursor-pointer">
                              {position.label} ({position.shortLabel})
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Window Selection for Glass Division */
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b pb-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      Select Windows *
                    </div>

                    {/* Interactive Vehicle Glass Diagram */}
                    <div className="my-4 px-2">
                      <ClickableVehicleDiagram
                        selectedWindows={selectedWindows}
                        onWindowToggle={handleWindowSelection}
                      />
                    </div>

                    {/* Privacy Tint Option */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="privacyTinted" className="text-sm font-medium">Are the broken window(s) "Factory Privacy Tinted"?</Label>
                        <p className="text-sm text-gray-500 mt-1">Only applicable for 'Glass Replacement'.</p>
                      </div>
                      <div className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="privacy-yes"
                            name="privacyTinted"
                            value="Yes"
                            checked={formData.privacyTinted === 'Yes'}
                            onChange={(e) => setFormData({ ...formData, privacyTinted: e.target.value })}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            data-testid="radio-privacy-yes"
                          />
                          <Label htmlFor="privacy-yes" className="text-sm font-normal cursor-pointer">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="privacy-no"
                            name="privacyTinted"
                            value="No"
                            checked={formData.privacyTinted === 'No'}
                            onChange={(e) => setFormData({ ...formData, privacyTinted: e.target.value })}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            data-testid="radio-privacy-no"
                          />
                          <Label htmlFor="privacy-no" className="text-sm font-normal cursor-pointer">No</Label>
                        </div>
                      </div>
                    </div>

                    {/* Primary (Windshield, Back Glass) */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">Primary Glass</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {WINDOW_TYPES.primary.map((window) => (
                          <div key={window.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={window.value}
                              data-testid={`checkbox-${window.value}`}
                              checked={selectedWindows.includes(window.value)}
                              onCheckedChange={(checked) => handleWindowSelection(window.value, !!checked)}
                            />
                            <Label htmlFor={window.value} className="text-sm font-normal cursor-pointer">
                              {window.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Door Windows */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">Door Windows</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {WINDOW_TYPES.doors.map((window) => (
                          <div key={window.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={window.value}
                              data-testid={`checkbox-${window.value}`}
                              checked={selectedWindows.includes(window.value)}
                              onCheckedChange={(checked) => handleWindowSelection(window.value, !!checked)}
                            />
                            <Label htmlFor={window.value} className="text-sm font-normal cursor-pointer">
                              {window.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quarter Panels */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">Quarter Panels</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {WINDOW_TYPES.quarterPanels.map((window) => (
                          <div key={window.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={window.value}
                              data-testid={`checkbox-${window.value}`}
                              checked={selectedWindows.includes(window.value)}
                              onCheckedChange={(checked) => handleWindowSelection(window.value, !!checked)}
                            />
                            <Label htmlFor={window.value} className="text-sm font-normal cursor-pointer">
                              {window.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Vents */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">Vents</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {WINDOW_TYPES.vents.map((window) => (
                          <div key={window.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={window.value}
                              data-testid={`checkbox-${window.value}`}
                              checked={selectedWindows.includes(window.value)}
                              onCheckedChange={(checked) => handleWindowSelection(window.value, !!checked)}
                            />
                            <Label htmlFor={window.value} className="text-sm font-normal cursor-pointer">
                              {window.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Other */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">Other</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {WINDOW_TYPES.other.map((window) => (
                          <div key={window.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={window.value}
                              data-testid={`checkbox-${window.value}`}
                              checked={selectedWindows.includes(window.value)}
                              onCheckedChange={(checked) => handleWindowSelection(window.value, !!checked)}
                            />
                            <Label htmlFor={window.value} className="text-sm font-normal cursor-pointer">
                              {window.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b pb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Additional Information
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes & Special Requests</Label>
                    <Textarea
                      id="notes"
                      data-testid="textarea-notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any specific requirements, damage details, or questions..."
                      className="min-h-24"
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <Label>Photos (Optional - Up to 5 files)</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        id="fileUpload"
                        data-testid="input-fileUpload"
                        onChange={handleFileUpload}
                        multiple
                        accept="image/*"
                        className="hidden"
                      />
                      <Label htmlFor="fileUpload" className="cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click to upload photos of damage or your vehicle</p>
                        </div>
                      </Label>
                      {uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                data-testid={`button-removeFile-${index}`}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    data-testid="button-submit"
                    className={`${isWheelsDivision ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'} px-8 py-3`}
                  >
                    {isSubmitting ? 'Submitting...' : isWheelsDivision ? 'Get My Wheel Repair Quote' : 'Get My Free Quote'}
                  </Button>
                </div>
              </form>
            </CardContent>
    </Card>
  );

  // Inline mode: render form directly without modal overlay
  if (inline) {
    return <div className="max-w-4xl mx-auto force-light">{formContent}</div>;
  }

  // Modal mode: render with overlay
  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto force-light">
      <div className="min-h-screen px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {formContent}
        </div>
      </div>
    </div>
  );
}