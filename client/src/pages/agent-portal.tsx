import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Shield, 
  FileText, 
  Phone,
  Mail,
  Building2,
  User,
  Car,
  AlertCircle
} from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function AgentPortal() {
  const [formData, setFormData] = useState({
    // Agent Information
    agentName: '',
    agencyName: '',
    agentPhone: '',
    agentEmail: '',
    licenseNumber: '',
    
    // Client Information  
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    policyNumber: '',
    claimNumber: '',
    deductible: '',
    
    // Vehicle Information
    year: '',
    make: '',
    model: '',
    vin: '',
    color: '',
    
    // Service Details
    serviceType: '',
    damageDescription: '',
    location: '',
    preferredDate: '',
    preferredTime: '',
    urgency: '',
    
    // Additional Information
    additionalNotes: '',
    clientConsent: false,
    agentAuthorization: false
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.clientConsent || !formData.agentAuthorization) {
      toast({
        title: "Required Consent",
        description: "Please confirm client consent and agent authorization.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/agent-portal/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error?.message || errorJson.message || errorText;
          }
        } catch {
          // Use default error message if can't parse response
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Claim Submitted Successfully",
          description: `The client's auto glass claim has been submitted (ID: ${result.transactionId}). You'll receive confirmation shortly.`,
        });

        // Reset form
        setFormData({
          agentName: '', agencyName: '', agentPhone: '', agentEmail: '', licenseNumber: '',
          clientName: '', clientPhone: '', clientEmail: '', policyNumber: '', claimNumber: '', deductible: '',
          year: '', make: '', model: '', vin: '', color: '',
          serviceType: '', damageDescription: '', location: '', preferredDate: '', preferredTime: '', urgency: '',
          additionalNotes: '', clientConsent: false, agentAuthorization: false
        });
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Agent portal submission error:', error);
      toast({
        title: "Submission Error",
        description: error instanceof Error ? error.message : "There was an error submitting the claim. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 force-light">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                ← Back to Home
              </Button>
            </Link>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Insurance Agent Portal
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Insurance Agent Portal
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Submit auto glass service requests on behalf of your clients. 
            Streamlined process for insurance agents and adjusters.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Direct Billing</h3>
              <p className="text-sm text-gray-600">
                We handle insurance billing and paperwork for your clients
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <FileText className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Documentation</h3>
              <p className="text-sm text-gray-600">
                Complete service documentation and photos provided
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Phone className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Direct Communication</h3>
              <p className="text-sm text-gray-600">
                Updates sent to both you and your client throughout service
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Agent Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Agent Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agentName">Agent Name *</Label>
                  <Input
                    id="agentName"
                    value={formData.agentName}
                    onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="agencyName">Agency/Company Name *</Label>
                  <Input
                    id="agencyName"
                    value={formData.agencyName}
                    onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="agentPhone">Agent Phone *</Label>
                  <Input
                    id="agentPhone"
                    type="tel"
                    value={formData.agentPhone}
                    onChange={(e) => setFormData({ ...formData, agentPhone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="agentEmail">Agent Email *</Label>
                  <Input
                    id="agentEmail"
                    type="email"
                    value={formData.agentEmail}
                    onChange={(e) => setFormData({ ...formData, agentEmail: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clientPhone">Client Phone *</Label>
                  <Input
                    id="clientPhone"
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="policyNumber">Policy Number *</Label>
                  <Input
                    id="policyNumber"
                    value={formData.policyNumber}
                    onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="claimNumber">Claim Number</Label>
                  <Input
                    id="claimNumber"
                    value={formData.claimNumber}
                    onChange={(e) => setFormData({ ...formData, claimNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="deductible">Deductible Amount</Label>
                  <Input
                    id="deductible"
                    value={formData.deductible}
                    onChange={(e) => setFormData({ ...formData, deductible: e.target.value })}
                    placeholder="$0, $100, $250, etc."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5 text-green-600" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2020"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    placeholder="Toyota"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Camry"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vin">VIN</Label>
                  <Input
                    id="vin"
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                    placeholder="17-character VIN"
                    maxLength={17}
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Blue"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Select value={formData.serviceType} onValueChange={(value) => setFormData({ ...formData, serviceType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="windshield-replacement">Windshield Replacement</SelectItem>
                      <SelectItem value="windshield-repair">Windshield Repair</SelectItem>
                      <SelectItem value="side-window">Side Window Replacement</SelectItem>
                      <SelectItem value="rear-window">Rear Window Replacement</SelectItem>
                      <SelectItem value="inspection-needed">Inspection Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="urgency">Urgency Level *</Label>
                  <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">Emergency (Same Day)</SelectItem>
                      <SelectItem value="urgent">Urgent (Within 24 hours)</SelectItem>
                      <SelectItem value="standard">Standard (2-3 days)</SelectItem>
                      <SelectItem value="flexible">Flexible (Within a week)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="preferredDate">Preferred Date</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="preferredTime">Preferred Time</Label>
                  <Select value={formData.preferredTime} onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                      <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                      <SelectItem value="anytime">Anytime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="location">Service Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Client's address or preferred location"
                  required
                />
              </div>
              <div>
                <Label htmlFor="damageDescription">Damage Description *</Label>
                <Textarea
                  id="damageDescription"
                  value={formData.damageDescription}
                  onChange={(e) => setFormData({ ...formData, damageDescription: e.target.value })}
                  placeholder="Describe the damage, size, location on windshield, cause if known, etc."
                  className="min-h-24"
                  required
                />
              </div>
              <div>
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  placeholder="Any special instructions, client preferences, or additional information"
                  className="min-h-20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Consent and Authorization */}
          <Card className="border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-800">Consent and Authorization</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="clientConsent" 
                  checked={formData.clientConsent}
                  onCheckedChange={(checked) => setFormData({ ...formData, clientConsent: !!checked })}
                />
                <Label htmlFor="clientConsent" className="text-sm leading-relaxed">
                  I confirm that the client has provided consent for this auto glass service request 
                  and has authorized me to submit this claim on their behalf. The client understands 
                  they may be responsible for any applicable deductible.
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="agentAuthorization" 
                  checked={formData.agentAuthorization}
                  onCheckedChange={(checked) => setFormData({ ...formData, agentAuthorization: !!checked })}
                />
                <Label htmlFor="agentAuthorization" className="text-sm leading-relaxed">
                  I am an authorized insurance agent/adjuster and have the authority to submit 
                  this claim. I certify that the information provided is accurate to the best 
                  of my knowledge.
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button type="submit" size="lg" className="bg-purple-600 hover:bg-purple-700 px-8">
              Submit Agent Claim
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}