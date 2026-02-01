import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Clock, 
  MapPin, 
  Phone, 
  Star,
  CheckCircle,
  Car,
  Wrench,
  Users,
  Award
} from 'lucide-react';
import { Link } from 'wouter';

export default function Features() {
  const features = [
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: "Same-Day Service",
      description: "Get your windshield replaced or repaired within hours, not days.",
      benefits: ["Emergency service available", "Flexible scheduling", "Mobile service to your location"]
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Lifetime Warranty",
      description: "All our work comes with a comprehensive lifetime warranty for peace of mind.",
      benefits: ["Defect protection", "Workmanship guarantee", "Free re-service if issues arise"]
    },
    {
      icon: <MapPin className="w-8 h-8 text-purple-600" />,
      title: "Mobile Service",
      description: "We come to you - at home, work, or anywhere convenient.",
      benefits: ["Save time and hassle", "Professional mobile units", "50 states coverage"]
    },
    {
      icon: <Car className="w-8 h-8 text-orange-600" />,
      title: "OEM Glass Quality",
      description: "Only premium OEM-equivalent glass that meets or exceeds factory standards.",
      benefits: ["Perfect fit guaranteed", "Safety certified", "Maintains vehicle integrity"]
    },
    {
      icon: <Users className="w-8 h-8 text-red-600" />,
      title: "Insurance Direct Billing",
      description: "We handle all insurance paperwork and billing for zero-hassle service.",
      benefits: ["All major insurers accepted", "No upfront costs", "Fast claim processing"]
    },
    {
      icon: <Award className="w-8 h-8 text-indigo-600" />,
      title: "Certified Technicians",
      description: "Expert technicians with years of experience and ongoing training.",
      benefits: ["Industry certified", "Continuous education", "Quality workmanship"]
    }
  ];

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
            <Badge variant="secondary">
              Wheels and Glass Features
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose Wheels and Glass?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're not just another glass company. We're your partners in keeping you safe 
            on the road with premium service, quality materials, and unmatched convenience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="h-full hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  {feature.icon}
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Process */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Our Simple 3-Step Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Request Quote</h3>
                <p className="text-gray-600 text-sm">
                  Contact us online or by phone for an instant quote on your auto glass needs.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Schedule Service</h3>
                <p className="text-gray-600 text-sm">
                  Pick a convenient time and location. We'll come to you with all equipment ready.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Professional Service</h3>
                <p className="text-gray-600 text-sm">
                  Our certified technician completes the work with lifetime warranty included.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center bg-blue-600 text-white p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Ready to Experience the Difference?</h2>
          <p className="text-blue-100 mb-6">
            Join thousands of satisfied customers who trust Wheels and Glass for their auto service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" variant="secondary">
                Request Quote
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Call Now: 1-800-EXPRESS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}