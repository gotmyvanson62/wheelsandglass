import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  X,
  MapPin,
  Users,
  Phone,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Wrench
} from 'lucide-react';

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  specialties: string[];
  serviceArea: string;
  city: string;
  state: string;
  status: 'available' | 'busy' | 'en_route' | 'offline';
  unit: string;
  phone?: string;
  email?: string;
}

interface TeamTableProps {
  onMessage?: (member: TeamMember) => void;
  onCall?: (member: TeamMember) => void;
}

// Team data organized by state
// Specialties match public quote form: Glass Replacement, Chip/Crack Repair, ADAS Calibration, Window Tinting
const teamData: TeamMember[] = [
  // California
  { id: 1, name: 'Mike Johnson', role: 'Lead Technician', specialties: ['Glass Replacement', 'Chip/Crack Repair'], serviceArea: 'San Diego, La Mesa, El Cajon (92101-92199)', city: 'Downtown San Diego', state: 'california', status: 'available', unit: 'Mobile Unit #1', phone: '(619) 555-0101' },
  { id: 2, name: 'Sarah Martinez', role: 'Senior Installer', specialties: ['Glass Replacement', 'Window Tinting'], serviceArea: 'Chula Vista, National City, Coronado', city: 'Downtown San Diego', state: 'california', status: 'busy', unit: 'Shop Based', phone: '(619) 555-0102' },
  { id: 3, name: 'David Wilson', role: 'Regional Manager', specialties: ['Glass Replacement', 'ADAS Calibration'], serviceArea: 'Carlsbad, Oceanside, Vista', city: 'Extended Coverage (Santee)', state: 'california', status: 'available', unit: 'Shop #2', phone: '(760) 555-0103' },
  { id: 4, name: 'Alex Rodriguez', role: 'Mobile Technician', specialties: ['Glass Replacement', 'Chip/Crack Repair'], serviceArea: 'North County, Mobile Coverage', city: 'Extended Coverage (Santee)', state: 'california', status: 'en_route', unit: 'Mobile Unit #3', phone: '(760) 555-0104' },
  { id: 5, name: 'Carlos Garcia', role: 'East County Lead', specialties: ['Glass Replacement', 'ADAS Calibration'], serviceArea: 'El Cajon, Santee, La Mesa', city: 'East County (El Cajon/Santee)', state: 'california', status: 'available', unit: 'East County Shop', phone: '(619) 555-0105' },
  { id: 6, name: 'Jennifer Liu', role: 'Quality Inspector', specialties: ['ADAS Calibration', 'Window Tinting'], serviceArea: 'All East County Locations', city: 'East County (El Cajon/Santee)', state: 'california', status: 'busy', unit: 'Quality Unit', phone: '(619) 555-0106' },
  { id: 7, name: 'Antonio Vasquez', role: 'South Bay Manager', specialties: ['Glass Replacement', 'Chip/Crack Repair'], serviceArea: 'Chula Vista, National City, Bonita', city: 'South Bay (Chula Vista/National City)', state: 'california', status: 'available', unit: 'Main Shop', phone: '(619) 555-0107' },

  // Arizona
  { id: 8, name: 'Carlos Rodriguez', role: 'Lead Technician', specialties: ['Glass Replacement', 'Chip/Crack Repair'], serviceArea: 'Phoenix Downtown, Tempe (85001-85050)', city: 'Phoenix Downtown', state: 'arizona', status: 'available', unit: 'Mobile Unit #AZ1', phone: '(602) 555-0201' },
  { id: 9, name: 'Amanda Chen', role: 'Senior Installer', specialties: ['ADAS Calibration', 'Glass Replacement'], serviceArea: 'Phoenix Central, Arcadia', city: 'Phoenix Downtown', state: 'arizona', status: 'busy', unit: 'Shop Based', phone: '(602) 555-0202' },
  { id: 10, name: 'Michael Torres', role: 'Luxury Specialist', specialties: ['Glass Replacement', 'Window Tinting'], serviceArea: 'Scottsdale, Paradise Valley (85250-85268)', city: 'Scottsdale / Paradise Valley', state: 'arizona', status: 'available', unit: 'Shop #AZ2', phone: '(480) 555-0203' },
  { id: 11, name: 'Rachel Kim', role: 'Mobile Technician', specialties: ['Chip/Crack Repair', 'Glass Replacement'], serviceArea: 'North Scottsdale, Fountain Hills', city: 'Scottsdale / Paradise Valley', state: 'arizona', status: 'en_route', unit: 'Mobile Unit #AZ3', phone: '(480) 555-0204' },
  { id: 12, name: 'Brandon Lee', role: 'East Valley Lead', specialties: ['Glass Replacement', 'ADAS Calibration'], serviceArea: 'Mesa, Gilbert, Chandler (85201-85299)', city: 'East Valley (Mesa/Gilbert)', state: 'arizona', status: 'available', unit: 'Shop #AZ3', phone: '(480) 555-0205' },
  { id: 13, name: 'Lisa Nguyen', role: 'Technician', specialties: ['Glass Replacement', 'Chip/Crack Repair'], serviceArea: 'Tempe, Apache Junction', city: 'East Valley (Mesa/Gilbert)', state: 'arizona', status: 'available', unit: 'Mobile Unit #AZ4', phone: '(480) 555-0206' },
  { id: 14, name: 'Kevin Martinez', role: 'Tucson Manager', specialties: ['Glass Replacement', 'ADAS Calibration'], serviceArea: 'Tucson Metro, Oro Valley', city: 'Tucson', state: 'arizona', status: 'available', unit: 'Tucson Shop', phone: '(520) 555-0207' },

  // Texas
  { id: 15, name: 'Robert Thompson', role: 'Dallas Lead', specialties: ['ADAS Calibration', 'Glass Replacement'], serviceArea: 'Dallas Downtown, Uptown (75201-75250)', city: 'Dallas', state: 'texas', status: 'available', unit: 'Mobile Unit #TX1', phone: '(214) 555-0301' },
  { id: 16, name: 'Maria Gonzalez', role: 'Senior Technician', specialties: ['Glass Replacement', 'Window Tinting'], serviceArea: 'Highland Park, University Park', city: 'Dallas', state: 'texas', status: 'busy', unit: 'Shop #TX1', phone: '(214) 555-0302' },
  { id: 17, name: 'James Anderson', role: 'Fort Worth Lead', specialties: ['Glass Replacement', 'Chip/Crack Repair'], serviceArea: 'Fort Worth, Arlington', city: 'Fort Worth', state: 'texas', status: 'available', unit: 'Shop #TX2', phone: '(817) 555-0303' },
  { id: 18, name: 'Michelle Davis', role: 'Mobile Technician', specialties: ['Chip/Crack Repair', 'Glass Replacement'], serviceArea: 'Keller, Southlake, Grapevine', city: 'Fort Worth', state: 'texas', status: 'en_route', unit: 'Mobile Unit #TX2', phone: '(817) 555-0304' },
  { id: 19, name: 'Daniel Hernandez', role: 'Houston Manager', specialties: ['Glass Replacement', 'ADAS Calibration'], serviceArea: 'Houston Downtown, Midtown, Galleria', city: 'Houston', state: 'texas', status: 'available', unit: 'Shop #TX3', phone: '(713) 555-0305' },
  { id: 20, name: 'Ashley Williams', role: 'Senior Installer', specialties: ['Glass Replacement', 'Window Tinting'], serviceArea: 'The Heights, Montrose', city: 'Houston', state: 'texas', status: 'available', unit: 'Mobile Unit #TX3', phone: '(713) 555-0306' },
  { id: 21, name: 'Christopher Brown', role: 'Technician', specialties: ['Glass Replacement', 'Chip/Crack Repair'], serviceArea: 'Katy, Sugar Land, Missouri City', city: 'Katy/Sugar Land', state: 'texas', status: 'busy', unit: 'Mobile Unit #TX4', phone: '(281) 555-0307' },
  { id: 22, name: 'Stephanie Taylor', role: 'Austin Lead', specialties: ['ADAS Calibration', 'Glass Replacement'], serviceArea: 'Austin Downtown, Domain, South Congress', city: 'Austin', state: 'texas', status: 'available', unit: 'Shop #TX4', phone: '(512) 555-0308' },
  { id: 23, name: 'Marcus Johnson', role: 'San Antonio Lead', specialties: ['Glass Replacement', 'Chip/Crack Repair'], serviceArea: 'San Antonio, Alamo Heights, Stone Oak', city: 'San Antonio', state: 'texas', status: 'available', unit: 'Shop #TX5', phone: '(210) 555-0309' },

  // Nevada
  { id: 24, name: 'Tyler Mitchell', role: 'Vegas Strip Lead', specialties: ['Glass Replacement', 'Window Tinting'], serviceArea: 'Las Vegas Strip, Paradise (89109-89169)', city: 'Las Vegas Strip', state: 'nevada', status: 'available', unit: 'Shop #NV1', phone: '(702) 555-0401' },
  { id: 25, name: 'Amber White', role: 'Senior Technician', specialties: ['ADAS Calibration', 'Glass Replacement'], serviceArea: 'Downtown, Arts District', city: 'Las Vegas Strip', state: 'nevada', status: 'busy', unit: 'Mobile Unit #NV1', phone: '(702) 555-0402' },
  { id: 26, name: 'Jordan Cooper', role: 'Henderson Manager', specialties: ['Glass Replacement', 'Chip/Crack Repair'], serviceArea: 'Henderson, Green Valley, Anthem', city: 'Henderson', state: 'nevada', status: 'available', unit: 'Shop #NV2', phone: '(702) 555-0403' },
  { id: 27, name: 'Brianna Scott', role: 'Mobile Technician', specialties: ['Chip/Crack Repair', 'Glass Replacement'], serviceArea: 'Boulder City, Lake Las Vegas', city: 'Henderson', state: 'nevada', status: 'en_route', unit: 'Mobile Unit #NV2', phone: '(702) 555-0404' },
  { id: 28, name: 'Nathan Roberts', role: 'North Vegas Lead', specialties: ['Glass Replacement', 'ADAS Calibration'], serviceArea: 'North Las Vegas, Summerlin, Centennial Hills', city: 'North LV/Summerlin', state: 'nevada', status: 'available', unit: 'Shop #NV3', phone: '(702) 555-0405' },
  { id: 29, name: 'Kayla Adams', role: 'Reno Manager', specialties: ['Glass Replacement', 'ADAS Calibration'], serviceArea: 'Reno, Sparks, Carson City', city: 'Reno', state: 'nevada', status: 'available', unit: 'Shop #NV4', phone: '(775) 555-0406' },

  // Florida
  { id: 30, name: 'Derek Foster', role: 'Miami Lead', specialties: ['Glass Replacement', 'Window Tinting'], serviceArea: 'Miami Beach, Downtown, Brickell', city: 'Miami', state: 'florida', status: 'available', unit: 'Shop #FL1', phone: '(305) 555-0501' },
  { id: 31, name: 'Nicole Reed', role: 'Senior Installer', specialties: ['ADAS Calibration', 'Glass Replacement'], serviceArea: 'Coral Gables, Coconut Grove', city: 'Miami', state: 'florida', status: 'busy', unit: 'Mobile Unit #FL1', phone: '(305) 555-0502' },
  { id: 32, name: 'Ryan Clark', role: 'Tampa Manager', specialties: ['Glass Replacement', 'Chip/Crack Repair'], serviceArea: 'Tampa Downtown, Ybor City, Hyde Park', city: 'Tampa', state: 'florida', status: 'available', unit: 'Shop #FL2', phone: '(813) 555-0503' },
  { id: 33, name: 'Jessica Turner', role: 'Orlando Lead', specialties: ['Glass Replacement', 'Window Tinting'], serviceArea: 'Orlando Downtown, International Drive', city: 'Orlando', state: 'florida', status: 'available', unit: 'Shop #FL3', phone: '(407) 555-0504' },
];

const states = [
  { value: 'all', label: 'All States' },
  { value: 'alabama', label: 'Alabama' },
  { value: 'alaska', label: 'Alaska' },
  { value: 'arizona', label: 'Arizona' },
  { value: 'arkansas', label: 'Arkansas' },
  { value: 'california', label: 'California' },
  { value: 'colorado', label: 'Colorado' },
  { value: 'connecticut', label: 'Connecticut' },
  { value: 'delaware', label: 'Delaware' },
  { value: 'florida', label: 'Florida' },
  { value: 'georgia', label: 'Georgia' },
  { value: 'hawaii', label: 'Hawaii' },
  { value: 'idaho', label: 'Idaho' },
  { value: 'illinois', label: 'Illinois' },
  { value: 'indiana', label: 'Indiana' },
  { value: 'iowa', label: 'Iowa' },
  { value: 'kansas', label: 'Kansas' },
  { value: 'kentucky', label: 'Kentucky' },
  { value: 'louisiana', label: 'Louisiana' },
  { value: 'maine', label: 'Maine' },
  { value: 'maryland', label: 'Maryland' },
  { value: 'massachusetts', label: 'Massachusetts' },
  { value: 'michigan', label: 'Michigan' },
  { value: 'minnesota', label: 'Minnesota' },
  { value: 'mississippi', label: 'Mississippi' },
  { value: 'missouri', label: 'Missouri' },
  { value: 'montana', label: 'Montana' },
  { value: 'nebraska', label: 'Nebraska' },
  { value: 'nevada', label: 'Nevada' },
  { value: 'new-hampshire', label: 'New Hampshire' },
  { value: 'new-jersey', label: 'New Jersey' },
  { value: 'new-mexico', label: 'New Mexico' },
  { value: 'new-york', label: 'New York' },
  { value: 'north-carolina', label: 'North Carolina' },
  { value: 'north-dakota', label: 'North Dakota' },
  { value: 'ohio', label: 'Ohio' },
  { value: 'oklahoma', label: 'Oklahoma' },
  { value: 'oregon', label: 'Oregon' },
  { value: 'pennsylvania', label: 'Pennsylvania' },
  { value: 'rhode-island', label: 'Rhode Island' },
  { value: 'south-carolina', label: 'South Carolina' },
  { value: 'south-dakota', label: 'South Dakota' },
  { value: 'tennessee', label: 'Tennessee' },
  { value: 'texas', label: 'Texas' },
  { value: 'utah', label: 'Utah' },
  { value: 'vermont', label: 'Vermont' },
  { value: 'virginia', label: 'Virginia' },
  { value: 'washington', label: 'Washington' },
  { value: 'west-virginia', label: 'West Virginia' },
  { value: 'wisconsin', label: 'Wisconsin' },
  { value: 'wyoming', label: 'Wyoming' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'available', label: 'Available' },
  { value: 'busy', label: 'Busy' },
  { value: 'en_route', label: 'En Route' },
  { value: 'offline', label: 'Offline' },
];

export function TeamTable({ onMessage, onCall }: TeamTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stateFilter, setStateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');

  // Get unique cities based on state filter
  const availableCities = useMemo(() => {
    const cities = teamData
      .filter(m => stateFilter === 'all' || m.state === stateFilter)
      .map(m => m.city);
    return ['All Cities', ...Array.from(new Set(cities))];
  }, [stateFilter]);

  // Get unique specialties
  const availableSpecialties = useMemo(() => {
    const specs = teamData.flatMap(m => m.specialties);
    return ['All Specialties', ...Array.from(new Set(specs))];
  }, []);

  const filteredMembers = useMemo(() => {
    return teamData.filter(member => {
      // State filter
      if (stateFilter !== 'all' && member.state !== stateFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && member.status !== statusFilter) return false;

      // City filter
      if (cityFilter && cityFilter !== 'All Cities' && member.city !== cityFilter) return false;

      // Specialty filter
      if (specialtyFilter && specialtyFilter !== 'All Specialties') {
        if (!member.specialties.includes(specialtyFilter)) return false;
      }

      // Search query (name, role, service area)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          member.name.toLowerCase().includes(query) ||
          member.role.toLowerCase().includes(query) ||
          member.serviceArea.toLowerCase().includes(query) ||
          member.specialties.some(s => s.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [searchQuery, stateFilter, statusFilter, cityFilter, specialtyFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setStateFilter('all');
    setStatusFilter('all');
    setCityFilter('');
    setSpecialtyFilter('');
  };

  const hasActiveFilters = searchQuery || stateFilter !== 'all' || statusFilter !== 'all' ||
    (cityFilter && cityFilter !== 'All Cities') || (specialtyFilter && specialtyFilter !== 'All Specialties');

  const getStatusBadge = (status: TeamMember['status']) => {
    const styles = {
      available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      busy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      en_route: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      offline: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    const labels = {
      available: 'Available',
      busy: 'Busy',
      en_route: 'En Route',
      offline: 'Offline',
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const getStateLabel = (state: string) => {
    const stateLabels: Record<string, string> = {
      alabama: 'AL',
      alaska: 'AK',
      arizona: 'AZ',
      arkansas: 'AR',
      california: 'CA',
      colorado: 'CO',
      connecticut: 'CT',
      delaware: 'DE',
      florida: 'FL',
      georgia: 'GA',
      hawaii: 'HI',
      idaho: 'ID',
      illinois: 'IL',
      indiana: 'IN',
      iowa: 'IA',
      kansas: 'KS',
      kentucky: 'KY',
      louisiana: 'LA',
      maine: 'ME',
      maryland: 'MD',
      massachusetts: 'MA',
      michigan: 'MI',
      minnesota: 'MN',
      mississippi: 'MS',
      missouri: 'MO',
      montana: 'MT',
      nebraska: 'NE',
      nevada: 'NV',
      'new-hampshire': 'NH',
      'new-jersey': 'NJ',
      'new-mexico': 'NM',
      'new-york': 'NY',
      'north-carolina': 'NC',
      'north-dakota': 'ND',
      ohio: 'OH',
      oklahoma: 'OK',
      oregon: 'OR',
      pennsylvania: 'PA',
      'rhode-island': 'RI',
      'south-carolina': 'SC',
      'south-dakota': 'SD',
      tennessee: 'TN',
      texas: 'TX',
      utah: 'UT',
      vermont: 'VT',
      virginia: 'VA',
      washington: 'WA',
      'west-virginia': 'WV',
      wisconsin: 'WI',
      wyoming: 'WY',
    };
    return stateLabels[state] || state.toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Directory
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search name, role, specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
            >
              <Filter className="w-4 h-4 mr-1" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">State</Label>
                <Select value={stateFilter} onValueChange={(v) => { setStateFilter(v); setCityFilter(''); }}>
                  <SelectTrigger className="h-9">
                    <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">City/Area</Label>
                <Select value={cityFilter || 'All Cities'} onValueChange={setCityFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Specialty</Label>
                <Select value={specialtyFilter || 'All Specialties'} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger className="h-9">
                    <Wrench className="w-3 h-3 mr-1 text-gray-400" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSpecialties.map(spec => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">{filteredMembers.length} team members found</span>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Results count when filters applied but panel closed */}
        {hasActiveFilters && !showFilters && (
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">{filteredMembers.length} team members found</span>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </Button>
          </div>
        )}

        {/* Team Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700 text-left text-xs text-gray-500 dark:text-gray-400">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Role</th>
                <th className="pb-3 font-medium hidden lg:table-cell">Specialties</th>
                <th className="pb-3 font-medium hidden xl:table-cell">Service Area</th>
                <th className="pb-3 font-medium hidden md:table-cell">Location</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium hidden lg:table-cell">Unit</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {filteredMembers.map(member => (
                <tr
                  key={member.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="py-3">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{member.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">{member.role}</div>
                    </div>
                  </td>
                  <td className="py-3 hidden sm:table-cell">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{member.role}</span>
                  </td>
                  <td className="py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {member.specialties.slice(0, 2).map((spec, i) => (
                        <Badge key={i} variant="outline" className="text-xs font-normal">
                          {spec}
                        </Badge>
                      ))}
                      {member.specialties.length > 2 && (
                        <Badge variant="outline" className="text-xs font-normal">
                          +{member.specialties.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 hidden xl:table-cell">
                    <div className="text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={member.serviceArea}>
                      {member.serviceArea}
                    </div>
                  </td>
                  <td className="py-3 hidden md:table-cell">
                    <div className="text-sm">
                      <span className="text-gray-900 dark:text-gray-100">{member.city}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">({getStateLabel(member.state)})</span>
                    </div>
                  </td>
                  <td className="py-3">{getStatusBadge(member.status)}</td>
                  <td className="py-3 hidden lg:table-cell">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{member.unit}</span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onMessage?.(member)}
                        title="Message"
                      >
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onCall?.(member)}
                        title="Call"
                      >
                        <Phone className="w-4 h-4 text-green-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p>No team members found matching your criteria</p>
            <Button variant="link" onClick={clearFilters} className="mt-2">
              Clear filters to see all team members
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
