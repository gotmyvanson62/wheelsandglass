import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Award, 
  CheckCircle, 
  Star,
  Zap,
  Eye,
  Thermometer,
  Gauge
} from 'lucide-react';
import { Link } from 'wouter';

export default function OEM() {
  const oemBenefits = [
    {
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      title: "Safety Standards",
      description: "Meets or exceeds all DOT and ANSI safety requirements"
    },
    {
      icon: <Eye className="w-6 h-6 text-green-600" />,
      title: "Optical Clarity",
      description: "Crystal clear vision with zero distortion or imperfections"
    },
    {
      icon: <Thermometer className="w-6 h-6 text-red-600" />,
      title: "Temperature Resistance",
      description: "Withstands extreme temperature changes and weather conditions"
    },
    {
      icon: <Gauge className="w-6 h-6 text-purple-600" />,
      title: "Perfect Fit",
      description: "Exact dimensions and curvature match your vehicle's specifications"
    }
  ];

  const glassFeatures = [
    "UV Protection coating blocks 99% of harmful rays",
    "Acoustic interlayer reduces road noise by up to 50%",
    "Advanced adhesive systems for superior bonding",
    "Precise thickness matching for structural integrity",
    "Rain sensor compatibility maintained",
    "Heated windshield functionality preserved"
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
              OEM Quality Glass
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <Award className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Premium OEM Quality Auto Glass
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We use only the highest quality OEM-equivalent glass that matches your vehicle 
            manufacturer's original specifications for safety, durability, and performance.
          </p>
        </div>

        {/* What is OEM Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">What Does OEM Quality Mean?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-6">
              OEM (Original Equipment Manufacturer) quality glass is manufactured to the exact same 
              standards and specifications as the glass that came with your vehicle from the factory. 
              This ensures perfect fit, optimal safety performance, and maintains your vehicle's 
              structural integrity.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {oemBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Glass Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-600" />
                Advanced Glass Technology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {glassFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-6 h-6 text-gold-500" />
                Quality Guarantee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Lifetime Warranty</h3>
                  <p className="text-green-700 text-sm">
                    Every OEM glass installation comes with our comprehensive lifetime warranty 
                    covering defects and workmanship.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Safety Certified</h3>
                  <p className="text-blue-700 text-sm">
                    All glass meets DOT Federal Motor Vehicle Safety Standards and carries 
                    proper safety markings.
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Perfect Match</h3>
                  <p className="text-purple-700 text-sm">
                    Guaranteed to match your vehicle's original glass specifications including 
                    tint, thickness, and special features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">OEM vs. Aftermarket Glass</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4 text-green-600">OEM Quality</th>
                    <th className="text-center py-3 px-4 text-red-600">Generic Aftermarket</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Safety Standards</td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4 text-red-500">Limited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Perfect Fit</td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4 text-red-500">May vary</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Optical Clarity</td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4 text-red-500">Inconsistent</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Durability</td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4 text-red-500">Lower quality</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Warranty</td>
                    <td className="text-center py-3 px-4 text-green-600">Lifetime</td>
                    <td className="text-center py-3 px-4 text-red-500">Limited/None</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Get Premium OEM Quality Glass Today</h2>
          <p className="text-blue-100 mb-6">
            Don't compromise on safety and quality. Choose OEM-equivalent glass for your vehicle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" variant="secondary">
                Get Free Quote
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Learn More About Installation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}