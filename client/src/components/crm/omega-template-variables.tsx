import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, MessageSquare, User, Calendar, MapPin, Building } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Omega EDI Template Variables with user-friendly descriptions
export const omegaTemplateVariables = {
  job: [
    { title: "Job Number", var: "{{id}}", desc: "Unique job reference number", example: "12345" },
    { title: "First Name", var: "{{customer_fname}}", desc: "Customer's first name", example: "John" },
    { title: "Last Name", var: "{{customer_surname}}", desc: "Customer's last name", example: "Smith" },
    { title: "Phone Number", var: "{{customer_phone}}", desc: "Customer contact number", example: "(555) 123-4567" },
    { title: "Email Address", var: "{{customer_email}}", desc: "Customer email address", example: "john@example.com" },
    { title: "Street Address", var: "{{customer_address}}", desc: "Customer street address", example: "123 Main St" },
    { title: "City", var: "{{customer_city}}", desc: "Customer city", example: "Dallas" },
    { title: "State", var: "{{customer_state}}", desc: "Customer state", example: "TX" },
    { title: "ZIP Code", var: "{{customer_zip}}", desc: "Customer ZIP code", example: "75201" },
    { title: "Total Amount", var: "{{invoice_amount}}", desc: "Total job cost", example: "$385.75" },
    { title: "Balance Due", var: "{{invoice_balance}}", desc: "Remaining balance", example: "$385.75" },
    { title: "Deductible", var: "{{account_deductible}}", desc: "Insurance deductible amount", example: "$100.00" },
    { title: "Job Status", var: "{{job_status}}", desc: "Current status of job", example: "Work Order" },
    { title: "Created Date", var: "{{date_created}}", desc: "When job was created", example: "01/15/2025" },
    { title: "Job Notes", var: "{{notes}}", desc: "Additional job information", example: "Driver side windshield" }
  ],
  vehicle: [
    { title: "Vehicle Year", var: "{{vehicle_year}}", desc: "Year of vehicle", example: "2018" },
    { title: "Vehicle Make", var: "{{vehicle_make}}", desc: "Vehicle manufacturer", example: "Honda" },
    { title: "Vehicle Model", var: "{{vehicle_model}}", desc: "Vehicle model name", example: "Accord" },
    { title: "Vehicle Details", var: "{{vehicle_description}}", desc: "Additional vehicle information", example: "4-door sedan" },
    { title: "VIN Number", var: "{{vehicle_vin}}", desc: "Vehicle identification number", example: "1HGBH41JXMN109186" },
    { title: "License Plate", var: "{{vehicle_plate}}", desc: "Vehicle license plate", example: "ABC123" },
    { title: "Glass Part", var: "{{Items_Description}}", desc: "Description of glass part needed", example: "Windshield w/ Rain Sensor" }
  ],
  appointment: [
    { title: "Appointment Date", var: "{{AppointmentDate}}", desc: "Scheduled service date", example: "January 22, 2025" },
    { title: "Appointment Time", var: "{{AppointmentTime}}", desc: "Scheduled service time", example: "10:00 AM" },
    { title: "Time Window", var: "{{AppointmentWindow}}", desc: "Available time range", example: "10:00 AM - 12:00 PM" },
    { title: "Arrival Window (1hr)", var: "{{ETA1}}", desc: "1-hour technician arrival estimate", example: "9:30 AM - 10:30 AM" },
    { title: "Arrival Window (2hr)", var: "{{ETA2}}", desc: "2-hour technician arrival estimate", example: "9:00 AM - 11:00 AM" },
    { title: "Service Location", var: "{{ServiceAddress}}", desc: "Where service will be performed", example: "123 Main St, Dallas, TX" },
    { title: "Service Type", var: "{{ServiceType}}", desc: "Mobile or shop service", example: "Mobile Service" },
    { title: "Technician Name", var: "{{technician_name}}", desc: "Assigned technician", example: "Mike Johnson" },
    { title: "Technician Phone", var: "{{technician_phone}}", desc: "Technician contact number", example: "(555) 987-6543" },
    { title: "Safe Drive Time", var: "{{SafeDriveAwayTime}}", desc: "When vehicle is safe to drive", example: "12:30 PM" }
  ],
  company: [
    { title: "Company Name", var: "{{RetailerName}}", desc: "Business name", example: "Express Auto Glass" },
    { title: "Company Phone", var: "{{RetailerTelephone}}", desc: "Main business number", example: "(555) 123-4567" },
    { title: "Location Name", var: "{{LocationName}}", desc: "Specific location name", example: "Dallas Main" },
    { title: "Location Address", var: "{{LocationAddress}}", desc: "Location full address", example: "456 Business Dr, Dallas, TX" },
    { title: "Location Phone", var: "{{LocationTelephone}}", desc: "Location contact number", example: "(555) 234-5678" },
    { title: "Payment Link", var: "{{PaymentLink}}", desc: "Online payment URL", example: "Click to pay: https://pay.example.com/12345" }
  ]
};

// Simple SMS templates with rich text formatting
export const smsTemplates = {
  dispatch_intro: {
    name: "Dispatch Introduction",
    description: "Initial contact message introducing dispatch team",
    richText: `This is the Dispatch Department for <strong>Company Name</strong>.\n\nOur team will communicate important information via this phone number. Simply reply to connect with Dispatch.\n\nReference: #<strong>Job Number</strong>\n\n* Text Only. No Photos *\n\n<strong>Company Name</strong>`,
    template: `This is the Dispatch Department for {{RetailerName}}.\n\nOur team will communicate important information via this phone number. Simply reply to connect with Dispatch.\n\nReference: #{{id}}\n\n* Text Only. No Photos *\n\n{{RetailerName}}`
  },
  quote_details: {
    name: "Quote Details",
    description: "Detailed quote with vehicle information and pricing",
    richText: `Quote: #<strong>Job Number</strong>\nYear: <strong>Vehicle Year</strong>\nMake: <strong>Vehicle Make</strong>\nModel: <strong>Vehicle Model</strong>\nVIN#: <strong>VIN Number</strong>\nParts: <strong>Glass Part</strong>\n\nTotal: <strong>Total Amount</strong> after tax + free mobile service\n\nSchedule: <strong>Payment Link</strong>\nPrice Match: Reply "PM"\nInsured: Reply "INS"\nQuote: <strong>Payment Link</strong>`,
    template: `Quote: #{{id}}\nYear: {{vehicle_year}}\nMake: {{vehicle_make}}\nModel: {{vehicle_model}}\nVIN#: {{vehicle_vin}}\nParts: {{Items_Description}}\n\nTotal: {{invoice_amount}} after tax + free mobile service\n\nSchedule: {{PaymentLink}}\nPrice Match: Reply "PM"\nInsured: Reply "INS"\nQuote: {{PaymentLink}}`
  },
  schedule_request: {
    name: "Schedule Request",
    description: "Request to schedule appointment with payment options",
    richText: `Would you like to proceed with scheduling your appointment? If you have any questions or concerns - no rush to reply here anytime.\n\nSchedule: <strong>Payment Link</strong>\nQuote: <strong>Payment Link</strong>\n\n<strong>Company Name</strong>\nReference: #<strong>Job Number</strong>`,
    template: `Would you like to proceed with scheduling your appointment? If you have any questions or concerns - no rush to reply here anytime.\n\nSchedule: {{PaymentLink}}\nQuote: {{PaymentLink}}\n\n{{RetailerName}}\nReference: #{{id}}`
  },
  appointment_confirmed: {
    name: "Appointment Confirmed",
    description: "Confirmation with technician and location details",
    richText: `Appointment confirmed for <strong>Appointment Date</strong> at <strong>Appointment Time</strong>.\n\nTechnician: <strong>Technician Name</strong>\nPhone: <strong>Technician Phone</strong>\nLocation: <strong>Service Location</strong>\n\nReference: #<strong>Job Number</strong>\n<strong>Company Name</strong>`,
    template: `Appointment confirmed for {{AppointmentDate}} at {{AppointmentTime}}.\n\nTechnician: {{technician_name}}\nPhone: {{technician_phone}}\nLocation: {{ServiceAddress}}\n\nReference: #{{id}}\n{{RetailerName}}`
  },
  tech_dispatch: {
    name: "Tech Dispatched",
    description: "Technician is en route notification",
    richText: `<strong>Technician Name</strong> is on the way.\nETA: <strong>Arrival Window (1hr)</strong>\nTech Phone: <strong>Technician Phone</strong>\n\nJob #<strong>Job Number</strong>\n<strong>Company Name</strong>`,
    template: `{{technician_name}} is on the way.\nETA: {{ETA1}}\nTech Phone: {{technician_phone}}\n\nJob #{{id}}\n{{RetailerName}}`
  },
  service_complete: {
    name: "Service Complete",
    description: "Service completion with safety and payment information",
    richText: `Service complete for your <strong>Vehicle Year</strong> <strong>Vehicle Make</strong> <strong>Vehicle Model</strong>.\n\nSafe to drive after: <strong>Safe Drive Time</strong>\nTotal: <strong>Total Amount</strong>\n\nJob #<strong>Job Number</strong>\n<strong>Company Name</strong>`,
    template: `Service complete for your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}.\n\nSafe to drive after: {{SafeDriveAwayTime}}\nTotal: {{invoice_amount}}\n\nJob #{{id}}\n{{RetailerName}}`
  }
};

interface OmegaTemplateVariablesProps {
  onTemplateSelect?: (template: string) => void;
}

export function OmegaTemplateVariables({ onTemplateSelect }: OmegaTemplateVariablesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customTemplate, setCustomTemplate] = useState('');
  const [activeTab, setActiveTab] = useState('templates');
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Variable copied to clipboard",
    });
  };

  const useTemplate = (template: string) => {
    setCustomTemplate(template);
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
    toast({
      title: "Template loaded",
      description: "Template ready for customization",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Omega EDI SMS Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          {/* Pre-built Templates */}
          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-3">
              {Object.entries(smsTemplates).map(([key, template]) => (
                <Card key={key} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="outline" className="text-xs">SMS</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{template.description}</p>
                      <div 
                        className="text-sm text-gray-700 bg-gray-50 p-3 rounded border whitespace-pre-line"
                        dangerouslySetInnerHTML={{ __html: template.richText.replace(/\n/g, '<br>') }}
                      />
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => useTemplate(template.template)}
                      className="ml-3"
                    >
                      Use
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Variable Reference */}
          <TabsContent value="variables" className="space-y-4">
            <Tabs defaultValue="job" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="job">Job</TabsTrigger>
                <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
                <TabsTrigger value="appointment">Appointment</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
              </TabsList>
              
              {Object.entries(omegaTemplateVariables).map(([category, variables]) => (
                <TabsContent key={category} value={category} className="space-y-2">
                  <div className="grid gap-2">
                    {variables.map((variable, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{variable.title}</h5>
                          <p className="text-xs text-gray-600 mt-1">{variable.desc}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="text-blue-600">Example:</span> {variable.example}
                          </p>
                          <code className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded mt-1 inline-block">
                            {variable.var}
                          </code>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(variable.var)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          {/* Custom Template Builder */}
          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-template">Custom SMS Template</Label>
                <Textarea
                  id="custom-template"
                  placeholder="Hi {{customer_fname}}! Your appointment for {{vehicle_year}} {{vehicle_make}} {{vehicle_model}} is..."
                  value={customTemplate}
                  onChange={(e) => setCustomTemplate(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use double braces for variables: {`{{variable_name}}`}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => onTemplateSelect?.(customTemplate)}
                  disabled={!customTemplate.trim()}
                >
                  Send Template
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => copyToClipboard(customTemplate)}
                  disabled={!customTemplate.trim()}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}