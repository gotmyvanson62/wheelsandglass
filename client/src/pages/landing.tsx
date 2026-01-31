import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { QuoteForm } from '@/components/quote-form';
import { 
  Car, 
  Shield, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Phone,
  MapPin,
  Star,
  FileText,
  Search,
  Navigation,
  Zap,
  Award,
  Wrench,
  Users,
  DollarSign
} from 'lucide-react';



export default function Landing() {
  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white force-light">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">Express Auto Glass</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50" asChild>
                <a href="tel:+1-800-EXPRESS" className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </a>
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsQuoteFormOpen(true)} data-testid="button-header-get-quote">
                Get Quote
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">
            Professional Auto Glass Services
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Express Auto Glass
            <span className="text-blue-600 block">Repair & Replacement</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Fast, reliable auto glass services with professional installation. Get an instant quote 
            and schedule your appointment today for windshields, windows, and all auto glass needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" asChild>
              <a href="tel:+1-800-EXPRESS" className="flex items-center justify-center">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">Call for Quote</span>
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={() => setIsQuoteFormOpen(true)}
              data-testid="button-hero-get-quote"
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base whitespace-nowrap">Get Online Quote</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>



      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-lg text-gray-600">Professional auto glass solutions for all your vehicle needs</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Windshield Replacement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Complete windshield replacement using OEM-quality glass with professional installation and warranty.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Same-Day Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Fast, reliable service with same-day appointments available. We come to you for convenient mobile service.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Insurance Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We work directly with your insurance company for hassle-free claims processing and billing.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Navigation Links Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white/50 rounded-lg">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Learn More</h2>
          <p className="text-lg text-gray-600">Explore our comprehensive auto glass solutions and specialized services</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/features">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-center">Our Features</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Discover what makes Express Auto Glass different - from same-day service to lifetime warranties.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/oem">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-center">OEM Quality Glass</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Learn about our premium OEM-equivalent glass that meets factory specifications.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/windshieldrepair">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-center">Windshield Repair</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Quick and affordable chip and crack repairs that restore your windshield's integrity.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/insurance">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-center">Insurance Claims</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  We work with all major insurance companies for hassle-free direct billing.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/agentportal">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-center">Agent Portal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Insurance agents can submit claims on behalf of clients through our dedicated portal.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/service-areas">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-teal-600" />
                </div>
                <CardTitle className="text-center">Service Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  Professional installation at your location. View our service coverage across states and cities.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-center">
          <Card className="hover:shadow-lg transition-shadow max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Phone className="w-6 h-6 mr-3 text-blue-600" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 text-center">
                Get an instant quote or schedule your service. Our expert technicians are ready to help.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full mb-3">
                Call for Immediate Service
                <Phone className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setIsQuoteFormOpen(true)} data-testid="button-service-quote">
                Request Online Quote
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-gray-600">
            <p>&copy; 2025 Express Auto Glass. Professional Auto Glass Services.</p>
            <div className="mt-2 sm:mt-0 flex gap-4">
              <button 
                onClick={() => setIsQuoteFormOpen(true)}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors bg-transparent border-none cursor-pointer"
                data-testid="button-footer-quote"
              >
                Request Quote
              </button>
              <Link href="/service-areas">
                <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors bg-transparent border-none cursor-pointer" data-testid="button-footer-service-areas">
                  Service Areas
                </button>
              </Link>
              <Link href="/admin/login">
                <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors bg-transparent border-none cursor-pointer">
                  Admin Portal
                </button>
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Quote Form Modal */}
      <QuoteForm 
        isOpen={isQuoteFormOpen} 
        onClose={() => setIsQuoteFormOpen(false)} 
      />
    </div>
  );
}