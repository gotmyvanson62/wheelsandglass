import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  Clock, 
  DollarSign, 
  Shield,
  AlertTriangle,
  CheckCircle,
  Eye,
  Zap
} from 'lucide-react';
import { Link } from 'wouter';

export default function WindshieldRepair() {
  const repairBenefits = [
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      title: "Quick Service",
      description: "Most repairs completed in 30 minutes or less"
    },
    {
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      title: "Cost Effective",
      description: "Repair costs 70-90% less than full replacement"
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      title: "Maintains Safety",
      description: "Restores structural integrity and prevents spreading"
    },
    {
      icon: <Eye className="w-6 h-6 text-orange-600" />,
      title: "Clear Results",
      description: "Nearly invisible repair that restores optical clarity"
    }
  ];

  const repairableTypes = [
    {
      type: "Bullseye",
      description: "Circular damage with impact point in center",
      size: "Up to 1 inch diameter",
      repairable: true
    },
    {
      type: "Star Break",
      description: "Radiating cracks from central impact point",
      size: "Up to 3 inches across",
      repairable: true
    },
    {
      type: "Chip",
      description: "Small piece of glass missing from surface",
      size: "Quarter size or smaller",
      repairable: true
    },
    {
      type: "Crack",
      description: "Single line crack across windshield",
      size: "Under 6 inches long",
      repairable: true
    },
    {
      type: "Combination",
      description: "Multiple types of damage together",
      size: "Case by case basis",
      repairable: "Sometimes"
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
              Windshield Repair Services
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <Wrench className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Windshield Repair
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Save time and money with expert windshield chip and crack repair. 
            Our advanced repair techniques restore your windshield's safety and clarity.
          </p>
        </div>

        {/* When to Repair vs Replace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Good Candidate for Repair
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Chip smaller than a quarter</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Crack shorter than 6 inches</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Damage outside driver's direct line of sight</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Outer glass layer not penetrated</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>No previous repair attempts</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Requires Replacement
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>Crack longer than 6 inches</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>Multiple cracks or extensive damage</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>Damage in driver's critical vision area</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>Deep chips penetrating both layers</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>Compromised structural integrity</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Repair Benefits */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Why Choose Windshield Repair?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {repairBenefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="bg-gray-100 p-3 rounded-full">
                      {benefit.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Types of Damage */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Types of Windshield Damage We Repair</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4">Damage Type</th>
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-left py-3 px-4">Typical Size</th>
                    <th className="text-center py-3 px-4">Repairable</th>
                  </tr>
                </thead>
                <tbody>
                  {repairableTypes.map((type, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4 font-medium">{type.type}</td>
                      <td className="py-3 px-4 text-gray-600">{type.description}</td>
                      <td className="py-3 px-4 text-sm">{type.size}</td>
                      <td className="text-center py-3 px-4">
                        {type.repairable === true ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        ) : type.repairable === false ? (
                          <AlertTriangle className="w-5 h-5 text-red-500 mx-auto" />
                        ) : (
                          <span className="text-yellow-600 text-sm">Case by case</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Repair Process */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Our Professional Repair Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Assessment</h3>
                <p className="text-gray-600 text-sm">
                  Thorough inspection to determine repairability and best approach
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Preparation</h3>
                <p className="text-gray-600 text-sm">
                  Clean damage area and apply stabilization to prevent spreading
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Injection</h3>
                <p className="text-gray-600 text-sm">
                  Inject specialized resin under pressure to fill the damage completely
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold mb-2">Curing</h3>
                <p className="text-gray-600 text-sm">
                  UV light curing and polishing for optimal clarity and strength
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Service */}
        <Card className="mb-16 border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Don't Wait - Act Fast!
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-4">
              <strong>Time is critical:</strong> Small chips and cracks can quickly spread due to:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>Temperature changes</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>Road vibrations</span>
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>Moisture infiltration</span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>Normal driving stress</span>
                </li>
              </ul>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-yellow-800 font-semibold">
                What starts as a $50 repair can become a $300+ replacement if you wait too long!
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}