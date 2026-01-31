import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { SERVICE_LOCATIONS, WINDOW_TYPES, SERVICE_TYPES, VEHICLE_YEARS, VEHICLE_MAKES } from '@/data/locations';
import { apiClient, handleApiError } from '@/lib/api-client';
import vehicleGlassDiagram from '@/assets/vehicle-glass-diagram.webp';
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
  CheckCircle
} from 'lucide-react';

interface QuoteFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuoteForm({ isOpen, onClose }: QuoteFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedWindows, setSelectedWindows] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
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

  const handleWindowSelection = (window: string, checked: boolean) => {
    if (checked) {
      setSelectedWindows([...selectedWindows, window]);
    } else {
      setSelectedWindows(selectedWindows.filter(w => w !== window));
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
      email: formData.email,
      phone: formData.mobilePhone,
      vin: formData.vin,
      serviceType: formData.serviceType,
      windowCount: selectedWindows.length,
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

    // Prepare submission data
    const submitData = {
      ...formData,
      selectedWindows,
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
        setUploadedFiles([]);
        setSubmitSuccess(false);
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

  // Success screen with animation
  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 force-light">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center transform transition-all duration-500 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Quote Request Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you, {formData.firstName}! We've received your quote request and will contact you within 24 hours with personalized pricing.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Processing your request...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto force-light">
      <div className="min-h-screen px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg sm:text-2xl">Get Your Free Quote</CardTitle>
                  <p className="text-blue-100 mt-1 text-sm sm:text-base">Complete the form below for personalized pricing and scheduling</p>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                  <X className="w-5 h-5" />
                </Button>
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
                        <SelectContent>
                          {SERVICE_LOCATIONS.map((location) => (
                            <SelectItem key={location.id} value={location.id}>{location.city}, {location.state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="serviceType">Service Type *</Label>
                      <Select value={formData.serviceType} onValueChange={(value) => setFormData({ ...formData, serviceType: value })}>
                        <SelectTrigger data-testid="select-serviceType">
                          <SelectValue placeholder="What do you need?" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_TYPES.map((type) => (
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
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
                        <SelectTrigger data-testid="select-year">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {VEHICLE_YEARS.map((year) => (
                            <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="make">Make</Label>
                      <Select value={formData.make} onValueChange={(value) => setFormData({ ...formData, make: value })}>
                        <SelectTrigger data-testid="select-make">
                          <SelectValue placeholder="Make" />
                        </SelectTrigger>
                        <SelectContent>
                          {VEHICLE_MAKES.map((make) => (
                            <SelectItem key={make.value} value={make.value}>{make.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        data-testid="input-model"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        placeholder="e.g., Civic, F-150"
                      />
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

                {/* Window Selection */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b pb-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Select Windows *
                  </div>
                  
                  {/* Vehicle Glass Diagram */}
                  <div className="flex justify-center my-4 px-2">
                    <img 
                      src={vehicleGlassDiagram} 
                      alt="Vehicle Glass Parts Selection Diagram" 
                      className="max-w-xl w-full h-auto"
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
                  
                  {/* Windshields */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Windshields</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {WINDOW_TYPES.windshields.map((window) => (
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

                  {/* Side Windows */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Side Windows</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {WINDOW_TYPES.sideWindows.map((window) => (
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
                    className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                  >
                    {isSubmitting ? 'Submitting...' : 'Get My Free Quote'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}