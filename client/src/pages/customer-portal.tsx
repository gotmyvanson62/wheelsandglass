import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Calendar, Clock, MapPin, User, Phone, Mail, Car, CheckCircle, ArrowRight } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";

export default function CustomerPortal() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [serviceAddress, setServiceAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    vehicleInfo: "",
  });

  // Get the transaction ID from URL params (would be passed from form submission)
  const urlParams = new URLSearchParams(window.location.search);
  const transactionId = urlParams.get('id');

  const { data: transaction, isLoading, error } = useQuery({
    queryKey: ['/api/transactions', transactionId],
    enabled: !!transactionId,
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center force-light">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Loading your appointment details...</p>
        </div>
      </div>
    );
  }

  // Handle missing transaction - show demo state
  if (!transaction || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3 md:p-4 force-light">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 max-w-md w-full">
          <div className="text-center mb-4 md:mb-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Customer Portal</h1>
            <p className="text-sm md:text-base text-gray-600">Wheels and Glass</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-yellow-800 mb-2">Demo Mode</h3>
            <p className="text-sm text-yellow-700">
              This portal would normally be accessed via a link sent after form submission. 
              To test with real data, submit a form through the Squarespace webhook first.
            </p>
          </div>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Form submission creates transaction</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Customer redirected to portal</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Pricing generated via Omega EDI</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Redirect to Square Appointments</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { data: availableSlots } = useQuery({
    queryKey: ['/api/appointments/available-slots'],
  });

  const { data: technicians } = useQuery({
    queryKey: ['/api/omega/technicians'],
  });

  const scheduleAppointmentMutation = useMutation({
    mutationFn: (appointmentData: any) => 
      apiRequest('POST', '/api/appointments/prepare-square-booking', appointmentData),
    onSuccess: (response: any) => {
      if (response.squareBookingUrl) {
        // Show success message and redirect
        toast({
          title: "Pricing Generated",
          description: "Redirecting to Square Appointments with your pricing...",
        });
        
        // Redirect to Square Appointments with pricing data
        setTimeout(() => {
          window.location.href = response.squareBookingUrl;
        }, 1500);
      } else {
        toast({
          title: "Pricing Ready",
          description: "Redirecting to Square Appointments...",
        });
      }
    },
    onError: () => {
      toast({
        title: "Pricing Generation Failed",
        description: "Unable to generate pricing. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Populate customer info from transaction
  useEffect(() => {
    if (transaction) {
      setCustomerInfo({
        name: (transaction as any).customerName || "",
        email: (transaction as any).customerEmail || "",
        phone: (transaction as any).customerPhone || "",
        vehicleInfo: `${(transaction as any).vehicleYear || ""} ${(transaction as any).vehicleMake || ""} ${(transaction as any).vehicleModel || ""}`.trim(),
      });
    }
  }, [transaction]);

  // Generate available dates (next 14 days, excluding weekends)
  const getAvailableDates = () => {
    const dates: Array<{ value: string; label: string; dayCode: string }> = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = addDays(today, i);
      const dayOfWeek = date.getDay();
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push({
          value: format(date, 'yyyy-MM-dd'),
          label: format(date, 'EEE, MMM d'),
          dayCode: format(date, 'MM/dd'),
        });
      }
    }
    
    return dates;
  };

  // Available time slots
  const getAvailableTimeSlots = () => {
    return [
      { value: "08:00", label: "8:00 AM" },
      { value: "09:00", label: "9:00 AM" },
      { value: "10:00", label: "10:00 AM" },
      { value: "11:00", label: "11:00 AM" },
      { value: "13:00", label: "1:00 PM" },
      { value: "14:00", label: "2:00 PM" },
      { value: "15:00", label: "3:00 PM" },
      { value: "16:00", label: "4:00 PM" },
    ];
  };

  const handleScheduleAppointment = () => {
    if (!selectedDate || !selectedTime || !serviceAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const appointmentData = {
      transactionId: parseInt(transactionId || "0"),
      requestedDate: selectedDate,
      requestedTime: selectedTime,
      serviceAddress,
      instructions: specialInstructions,
      customerInfo,
      type: "Mobile", // Default to mobile service
    };

    scheduleAppointmentMutation.mutate(appointmentData);
  };

  if (!transactionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center force-light">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Invalid Access</h2>
            <p className="text-gray-600">
              Please access this portal through the link provided in your confirmation email.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 force-light">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-blue-500 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">Appointment Information</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Form Submitted</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Schedule Appointment</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-400">Service Complete</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Information */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Customer Name</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
                  {customerInfo.name || "Loading..."}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
                  {customerInfo.email || "Loading..."}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Phone</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
                  {customerInfo.phone || "Not provided"}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Vehicle</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded border text-sm flex items-center">
                  <Car className="w-4 h-4 mr-2 text-gray-500" />
                  {customerInfo.vehicleInfo || "Loading..."}
                </div>
              </div>

              {(transaction as any)?.damageDescription && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Service Request</Label>
                  <div className="mt-1 p-3 bg-blue-50 rounded border text-sm">
                    {(transaction as any).damageDescription}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointment Scheduling */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Appointment for Unknown Date - Mobile</CardTitle>
              <Badge variant="secondary" className="w-fit">Open</Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
                
                {getAvailableDates().map((date) => (
                  <button
                    key={date.value}
                    onClick={() => setSelectedDate(date.value)}
                    className={`p-2 text-sm rounded border text-center ${
                      selectedDate === date.value
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div>{date.dayCode}</div>
                  </button>
                ))}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="requested-date">Requested Date</Label>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Date" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDates().map((date) => (
                        <SelectItem key={date.value} value={date.value}>
                          {date.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="scheduled-date">Scheduled Date</Label>
                  <Select disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="To be confirmed" />
                    </SelectTrigger>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="service-address">Service Address</Label>
                  <Input
                    id="service-address"
                    placeholder="Address Search..."
                    value={serviceAddress}
                    onChange={(e) => setServiceAddress(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="service-type">Type</Label>
                  <Select defaultValue="mobile">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="shop">Shop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="technician">Technician</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-assign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-assign</SelectItem>
                      {Array.isArray(technicians) && technicians.map((tech: any) => (
                        <SelectItem key={tech.id} value={tech.id.toString()}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="time-slot">Preferred Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Time" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableTimeSlots().map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="required-skills">Required Skills</Label>
                  <Select defaultValue="none">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="windshield">Windshield Replacement</SelectItem>
                      <SelectItem value="side-window">Side Window</SelectItem>
                      <SelectItem value="rear-window">Rear Window</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any special instructions or notes for the technician..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button variant="outline">
                  Save Draft
                </Button>
                <Button
                  onClick={handleScheduleAppointment}
                  disabled={scheduleAppointmentMutation.isPending || !selectedDate || !selectedTime || !serviceAddress}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {scheduleAppointmentMutation.isPending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Generating Pricing...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Get Pricing & Schedule
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-medium">Instant Pricing</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    We'll calculate your exact pricing based on your vehicle and service needs
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-yellow-500" />
                </div>
                <div>
                  <h4 className="font-medium">Choose Your Time</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Select from available appointment slots that work best for your schedule
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <h4 className="font-medium">Professional Service</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Expert installation at your location with warranty included
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}