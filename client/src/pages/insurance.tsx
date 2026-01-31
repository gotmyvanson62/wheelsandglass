import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CreditCard, 
  Clock, 
  CheckCircle,
  Phone,
  FileText,
  DollarSign,
  Users
} from 'lucide-react';
import { Link } from 'wouter';

export default function Insurance() {
  const majorInsurers = [
    "State Farm", "GEICO", "Progressive", "Allstate", "USAA", "Liberty Mutual",
    "Farmers", "Nationwide", "American Family", "Travelers", "Safeco", "Mercury",
    "MetLife", "21st Century", "Esurance", "The General", "Direct General"
  ];

  const insuranceProcess = [
    {
      step: "1",
      title: "Verify Coverage",
      description: "We check your policy details and deductible amount",
      icon: <Shield className="w-6 h-6 text-blue-600" />
    },
    {
      step: "2", 
      title: "Direct Billing",
      description: "We handle all paperwork and bill your insurance directly",
      icon: <FileText className="w-6 h-6 text-green-600" />
    },
    {
      step: "3",
      title: "You Pay Deductible",
      description: "Only pay your deductible amount, if any",
      icon: <CreditCard className="w-6 h-6 text-purple-600" />
    },
    {
      step: "4",
      title: "Service Complete", 
      description: "Professional installation with lifetime warranty",
      icon: <CheckCircle className="w-6 h-6 text-green-600" />
    }
  ];

  const coverageTypes = [
    {
      type: "Comprehensive Coverage",
      description: "Covers windshield repair/replacement from road debris, weather, vandalism",
      deductible: "Usually waived for repairs, may apply to replacements",
      popular: true
    },
    {
      type: "Full Glass Coverage",
      description: "Premium add-on that covers all glass with $0 deductible",
      deductible: "$0 deductible for all glass work",
      popular: false
    },
    {
      type: "Collision Coverage",
      description: "Covers glass damage from accidents or collisions",
      deductible: "Standard collision deductible applies",
      popular: false
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
              Insurance Claims Made Easy
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <Shield className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Insurance Claims Made Simple
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We work directly with all major insurance companies to make your auto glass 
            repair or replacement as hassle-free as possible. No upfront costs, minimal paperwork.
          </p>
        </div>

        {/* Key Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CreditCard className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle>Direct Insurance Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We bill your insurance company directly. You only pay your deductible, if applicable.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <CardTitle>Fast Claim Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We handle all paperwork and communications with your insurance company for you.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <CardTitle>No Upfront Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Most repairs are covered 100%. For replacements, you typically only pay your deductible.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Insurance Process */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">How Our Insurance Process Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {insuranceProcess.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-gray-100 p-3 rounded-full">
                      {item.icon}
                    </div>
                  </div>
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Coverage Types */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Types of Glass Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {coverageTypes.map((coverage, index) => (
                <div key={index} className={`border rounded-lg p-6 ${coverage.popular ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{coverage.type}</h3>
                        {coverage.popular && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Most Common
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{coverage.description}</p>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">{coverage.deductible}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accepted Insurance Companies */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="w-6 h-6" />
              We Work With All Major Insurance Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {majorInsurers.map((insurer, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                  <span className="text-sm font-medium text-gray-700">{insurer}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-center">
              Don't see your insurance company listed? No problem! We work with virtually all insurance providers.
            </p>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mb-16 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-800">Important Insurance Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-green-600">✓ What's Typically Covered:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Windshield chips and cracks from road debris
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Weather-related glass damage (hail, falling branches)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Vandalism and theft-related glass damage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Side and rear window replacement
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-blue-600">ℹ Good to Know:</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Most insurers waive deductibles for windshield repairs</li>
                  <li>• Claims typically don't affect your premium rates</li>
                  <li>• We provide detailed photos and documentation</li>
                  <li>• Your insurance may require approved glass suppliers</li>
                  <li>• Some policies have preferred provider networks</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Portal CTA */}
        <Card className="mb-16 border-purple-200">
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-purple-800 flex items-center gap-2">
              <Users className="w-6 h-6" />
              For Insurance Agents
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-4">
              Are you an insurance agent helping a client with an auto glass claim? 
              Use our dedicated agent portal to submit claims quickly and efficiently.
            </p>
            <Link href="/agentportal">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Access Agent Portal
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-green-600 text-white p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Ready to File Your Insurance Claim?</h2>
          <p className="text-blue-100 mb-6">
            Let us handle the paperwork while you get back on the road safely. Most claims processed same-day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-lg">
                Start Insurance Claim
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Phone className="w-4 h-4 mr-2" />
              Call: 1-800-EXPRESS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}