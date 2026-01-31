import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useLocation } from 'wouter';
import { 
  MapPin,
  ArrowLeft,
  Car,
  Clock,
  Star,
  Phone,
  CheckCircle,
  Navigation,
  Users
} from 'lucide-react';

interface ServiceArea {
  city: string;
  zipCodes: string[];
  driveTime: string;
  serviceType: 'full' | 'limited';
  population?: string;
}

// Comprehensive service areas for all 48 contiguous US states with 3 cities each
const stateServiceAreas = {
  alabama: {
    name: 'Alabama',
    areas: [
      {
        city: "Birmingham",
        zipCodes: ["35201", "35202", "35203", "35204", "35205", "35206", "35207", "35208", "35209", "35210"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "200K+"
      },
      {
        city: "Montgomery",
        zipCodes: ["36101", "36102", "36103", "36104", "36105", "36106", "36107", "36108", "36109", "36110"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "200K+"
      },
      {
        city: "Mobile",
        zipCodes: ["36601", "36602", "36603", "36604", "36605", "36606", "36607", "36608", "36609", "36610"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "187K+"
      }
    ]
  },
  alaska: {
    name: 'Alaska',
    areas: [
      {
        city: "Anchorage",
        zipCodes: ["99501", "99502", "99503", "99504", "99505", "99506", "99507", "99508", "99509", "99510"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "291K+"
      },
      {
        city: "Fairbanks",
        zipCodes: ["99701", "99702", "99703", "99704", "99705", "99706", "99707", "99708", "99709", "99710"],
        driveTime: "45-60 minutes",
        serviceType: "limited" as const,
        population: "31K+"
      },
      {
        city: "Juneau",
        zipCodes: ["99801", "99802", "99803", "99811", "99821", "99824", "99850"],
        driveTime: "60-90 minutes",
        serviceType: "limited" as const,
        population: "32K+"
      }
    ]
  },
  arizona: {
    name: 'Arizona',
    areas: [
      {
        city: "Phoenix",
        zipCodes: ["85001", "85002", "85003", "85004", "85006", "85007", "85008", "85009", "85012", "85013"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "1.7M+"
      },
      {
        city: "Tucson",
        zipCodes: ["85701", "85702", "85703", "85704", "85705", "85706", "85707", "85708", "85709", "85710"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "548K+"
      },
      {
        city: "Mesa",
        zipCodes: ["85201", "85202", "85203", "85204", "85205", "85206", "85207", "85208", "85209", "85210"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "504K+"
      }
    ]
  },
  arkansas: {
    name: 'Arkansas',
    areas: [
      {
        city: "Little Rock",
        zipCodes: ["72201", "72202", "72203", "72204", "72205", "72206", "72207", "72209", "72210", "72211"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "198K+"
      },
      {
        city: "Fort Smith",
        zipCodes: ["72901", "72902", "72903", "72904", "72905", "72906", "72908", "72913", "72914", "72916"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "88K+"
      },
      {
        city: "Fayetteville",
        zipCodes: ["72701", "72702", "72703", "72704", "72730", "72732", "72734", "72764"],
        driveTime: "50-65 minutes",
        serviceType: "limited" as const,
        population: "93K+"
      }
    ]
  },
  california: {
    name: 'California',
    areas: [
      {
        city: "Los Angeles",
        zipCodes: ["90001", "90002", "90003", "90004", "90005", "90006", "90007", "90008", "90009", "90010"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "3.9M+"
      },
      {
        city: "San Diego",
        zipCodes: ["92101", "92102", "92103", "92104", "92105", "92106", "92107", "92108", "92109", "92110"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "1.4M+"
      },
      {
        city: "San Jose",
        zipCodes: ["95101", "95102", "95103", "95106", "95108", "95109", "95110", "95111", "95112", "95113"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "1.0M+"
      }
    ]
  },
  colorado: {
    name: 'Colorado',
    areas: [
      {
        city: "Denver",
        zipCodes: ["80201", "80202", "80203", "80204", "80205", "80206", "80207", "80208", "80209", "80210"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "715K+"
      },
      {
        city: "Colorado Springs",
        zipCodes: ["80901", "80902", "80903", "80904", "80905", "80906", "80907", "80908", "80909", "80910"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "478K+"
      },
      {
        city: "Aurora",
        zipCodes: ["80010", "80011", "80012", "80013", "80014", "80015", "80016", "80017", "80018", "80019"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "386K+"
      }
    ]
  },
  connecticut: {
    name: 'Connecticut',
    areas: [
      {
        city: "Bridgeport",
        zipCodes: ["06601", "06602", "06604", "06605", "06606", "06607", "06608", "06610", "06673"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "148K+"
      },
      {
        city: "New Haven",
        zipCodes: ["06501", "06502", "06503", "06504", "06505", "06506", "06507", "06508", "06509", "06510"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "134K+"
      },
      {
        city: "Hartford",
        zipCodes: ["06101", "06102", "06103", "06104", "06105", "06106", "06107", "06108", "06109", "06110"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "121K+"
      }
    ]
  },
  delaware: {
    name: 'Delaware',
    areas: [
      {
        city: "Wilmington",
        zipCodes: ["19801", "19802", "19803", "19804", "19805", "19806", "19807", "19808", "19809"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "70K+"
      },
      {
        city: "Dover",
        zipCodes: ["19901", "19902", "19903", "19904", "19905", "19906", "19909"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "38K+"
      },
      {
        city: "Newark",
        zipCodes: ["19702", "19711", "19713", "19714", "19715", "19716", "19717"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "33K+"
      }
    ]
  },
  florida: {
    name: 'Florida',
    areas: [
      {
        city: "Miami",
        zipCodes: ["33101", "33109", "33111", "33112", "33114", "33116", "33119", "33122", "33124", "33125"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "467K+"
      },
      {
        city: "Orlando",
        zipCodes: ["32789", "32801", "32803", "32804", "32805", "32806", "32807", "32808", "32809", "32810"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "307K+"
      },
      {
        city: "Tampa",
        zipCodes: ["33601", "33602", "33603", "33604", "33605", "33606", "33607", "33608", "33609", "33610"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "384K+"
      }
    ]
  },
  georgia: {
    name: 'Georgia',
    areas: [
      {
        city: "Atlanta",
        zipCodes: ["30301", "30302", "30303", "30304", "30305", "30306", "30307", "30308", "30309", "30310"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "498K+"
      },
      {
        city: "Augusta",
        zipCodes: ["30901", "30902", "30903", "30904", "30905", "30906", "30907", "30908", "30909", "30910"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "197K+"
      },
      {
        city: "Columbus",
        zipCodes: ["31901", "31902", "31903", "31904", "31905", "31906", "31907", "31908", "31909", "31914"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "206K+"
      }
    ]
  },
  idaho: {
    name: 'Idaho',
    areas: [
      {
        city: "Boise",
        zipCodes: ["83701", "83702", "83703", "83704", "83705", "83706", "83707", "83708", "83709", "83712"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "235K+"
      },
      {
        city: "Nampa",
        zipCodes: ["83651", "83652", "83653", "83686", "83687"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "100K+"
      },
      {
        city: "Meridian",
        zipCodes: ["83642", "83646"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "117K+"
      }
    ]
  },
  illinois: {
    name: 'Illinois',
    areas: [
      {
        city: "Chicago",
        zipCodes: ["60601", "60602", "60603", "60604", "60605", "60606", "60607", "60608", "60609", "60610"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "2.7M+"
      },
      {
        city: "Aurora",
        zipCodes: ["60502", "60503", "60504", "60505", "60506", "60507"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "180K+"
      },
      {
        city: "Rockford",
        zipCodes: ["61101", "61102", "61103", "61104", "61105", "61106", "61107", "61108", "61109", "61110"],
        driveTime: "50-65 minutes",
        serviceType: "limited" as const,
        population: "148K+"
      }
    ]
  },
  indiana: {
    name: 'Indiana',
    areas: [
      {
        city: "Indianapolis",
        zipCodes: ["46201", "46202", "46203", "46204", "46205", "46206", "46207", "46208", "46209", "46210"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "887K+"
      },
      {
        city: "Fort Wayne",
        zipCodes: ["46801", "46802", "46803", "46804", "46805", "46806", "46807", "46808", "46809", "46814"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "270K+"
      },
      {
        city: "Evansville",
        zipCodes: ["47701", "47702", "47703", "47704", "47705", "47706", "47708", "47710", "47711", "47712"],
        driveTime: "50-65 minutes",
        serviceType: "full" as const,
        population: "117K+"
      }
    ]
  },
  iowa: {
    name: 'Iowa',
    areas: [
      {
        city: "Des Moines",
        zipCodes: ["50301", "50302", "50303", "50304", "50305", "50306", "50307", "50308", "50309", "50310"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "214K+"
      },
      {
        city: "Cedar Rapids",
        zipCodes: ["52401", "52402", "52403", "52404", "52405", "52411"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "133K+"
      },
      {
        city: "Davenport",
        zipCodes: ["52801", "52802", "52803", "52804", "52805", "52806", "52807", "52808", "52809"],
        driveTime: "50-65 minutes",
        serviceType: "limited" as const,
        population: "101K+"
      }
    ]
  },
  kansas: {
    name: 'Kansas',
    areas: [
      {
        city: "Wichita",
        zipCodes: ["67201", "67202", "67203", "67204", "67205", "67206", "67207", "67208", "67209", "67210"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "397K+"
      },
      {
        city: "Overland Park",
        zipCodes: ["66201", "66202", "66203", "66204", "66206", "66207", "66208", "66209", "66210", "66212"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "197K+"
      },
      {
        city: "Kansas City",
        zipCodes: ["66101", "66102", "66103", "66104", "66105", "66106", "66109", "66111", "66112", "66115"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "156K+"
      }
    ]
  },
  kentucky: {
    name: 'Kentucky',
    areas: [
      {
        city: "Louisville",
        zipCodes: ["40201", "40202", "40203", "40204", "40205", "40206", "40207", "40208", "40209", "40210"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "617K+"
      },
      {
        city: "Lexington",
        zipCodes: ["40501", "40502", "40503", "40504", "40505", "40506", "40507", "40508", "40509", "40510"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "323K+"
      },
      {
        city: "Bowling Green",
        zipCodes: ["42101", "42102", "42103", "42104"],
        driveTime: "50-65 minutes",
        serviceType: "limited" as const,
        population: "72K+"
      }
    ]
  },
  louisiana: {
    name: 'Louisiana',
    areas: [
      {
        city: "New Orleans",
        zipCodes: ["70112", "70113", "70114", "70115", "70116", "70117", "70118", "70119", "70121", "70122"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "383K+"
      },
      {
        city: "Baton Rouge",
        zipCodes: ["70801", "70802", "70803", "70804", "70805", "70806", "70807", "70808", "70809", "70810"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "227K+"
      },
      {
        city: "Shreveport",
        zipCodes: ["71101", "71102", "71103", "71104", "71105", "71106", "71107", "71108", "71109", "71115"],
        driveTime: "50-65 minutes",
        serviceType: "full" as const,
        population: "187K+"
      }
    ]
  },
  maine: {
    name: 'Maine',
    areas: [
      {
        city: "Portland",
        zipCodes: ["04101", "04102", "04103", "04104", "04105", "04106", "04107", "04108", "04109", "04110"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "68K+"
      },
      {
        city: "Lewiston",
        zipCodes: ["04240", "04241", "04243"],
        driveTime: "45-60 minutes",
        serviceType: "limited" as const,
        population: "36K+"
      },
      {
        city: "Bangor",
        zipCodes: ["04401", "04402", "04412"],
        driveTime: "60-75 minutes",
        serviceType: "limited" as const,
        population: "31K+"
      }
    ]
  },
  maryland: {
    name: 'Maryland',
    areas: [
      {
        city: "Baltimore",
        zipCodes: ["21201", "21202", "21203", "21204", "21205", "21206", "21207", "21208", "21209", "21210"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "576K+"
      },
      {
        city: "Frederick",
        zipCodes: ["21701", "21702", "21703", "21704", "21705"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "78K+"
      },
      {
        city: "Rockville",
        zipCodes: ["20850", "20851", "20852", "20853"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "68K+"
      }
    ]
  },
  massachusetts: {
    name: 'Massachusetts',
    areas: [
      {
        city: "Boston",
        zipCodes: ["02101", "02102", "02103", "02104", "02105", "02106", "02107", "02108", "02109", "02110"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "695K+"
      },
      {
        city: "Worcester",
        zipCodes: ["01601", "01602", "01603", "01604", "01605", "01606", "01607", "01608", "01609", "01610"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "206K+"
      },
      {
        city: "Springfield",
        zipCodes: ["01101", "01102", "01103", "01104", "01105", "01106", "01107", "01108", "01109", "01119"],
        driveTime: "50-65 minutes",
        serviceType: "full" as const,
        population: "155K+"
      }
    ]
  },
  michigan: {
    name: 'Michigan',
    areas: [
      {
        city: "Detroit",
        zipCodes: ["48201", "48202", "48203", "48204", "48205", "48206", "48207", "48208", "48209", "48210"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "639K+"
      },
      {
        city: "Grand Rapids",
        zipCodes: ["49501", "49502", "49503", "49504", "49505", "49506", "49507", "49508", "49509", "49510"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "198K+"
      },
      {
        city: "Warren",
        zipCodes: ["48088", "48089", "48091", "48092", "48093"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "139K+"
      }
    ]
  },
  minnesota: {
    name: 'Minnesota',
    areas: [
      {
        city: "Minneapolis",
        zipCodes: ["55401", "55402", "55403", "55404", "55405", "55406", "55407", "55408", "55409", "55410"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "429K+"
      },
      {
        city: "Saint Paul",
        zipCodes: ["55101", "55102", "55103", "55104", "55105", "55106", "55107", "55108", "55109", "55110"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "308K+"
      },
      {
        city: "Rochester",
        zipCodes: ["55901", "55902", "55903", "55904", "55905", "55906"],
        driveTime: "50-65 minutes",
        serviceType: "full" as const,
        population: "121K+"
      }
    ]
  },
  mississippi: {
    name: 'Mississippi',
    areas: [
      {
        city: "Jackson",
        zipCodes: ["39201", "39202", "39203", "39204", "39205", "39206", "39207", "39208", "39209", "39210"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "153K+"
      },
      {
        city: "Gulfport",
        zipCodes: ["39501", "39502", "39503", "39505", "39506", "39507"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "72K+"
      },
      {
        city: "Southaven",
        zipCodes: ["38671", "38672"],
        driveTime: "50-65 minutes",
        serviceType: "limited" as const,
        population: "54K+"
      }
    ]
  },
  missouri: {
    name: 'Missouri',
    areas: [
      {
        city: "Kansas City",
        zipCodes: ["64101", "64102", "64105", "64106", "64108", "64109", "64110", "64111", "64112", "64113"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "508K+"
      },
      {
        city: "Saint Louis",
        zipCodes: ["63101", "63102", "63103", "63104", "63105", "63106", "63107", "63108", "63109", "63110"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "301K+"
      },
      {
        city: "Springfield",
        zipCodes: ["65801", "65802", "65803", "65804", "65806", "65807", "65808", "65809", "65810"],
        driveTime: "50-65 minutes",
        serviceType: "full" as const,
        population: "169K+"
      }
    ]
  },
  montana: {
    name: 'Montana',
    areas: [
      {
        city: "Billings",
        zipCodes: ["59101", "59102", "59105", "59106", "59107"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "117K+"
      },
      {
        city: "Missoula",
        zipCodes: ["59801", "59802", "59803", "59804", "59806", "59807", "59808"],
        driveTime: "60-75 minutes",
        serviceType: "limited" as const,
        population: "75K+"
      },
      {
        city: "Great Falls",
        zipCodes: ["59401", "59404", "59405"],
        driveTime: "50-65 minutes",
        serviceType: "limited" as const,
        population: "60K+"
      }
    ]
  },
  nebraska: {
    name: 'Nebraska',
    areas: [
      {
        city: "Omaha",
        zipCodes: ["68101", "68102", "68103", "68104", "68105", "68106", "68107", "68108", "68109", "68110"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "486K+"
      },
      {
        city: "Lincoln",
        zipCodes: ["68501", "68502", "68503", "68504", "68505", "68506", "68507", "68508", "68510", "68512"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "295K+"
      },
      {
        city: "Bellevue",
        zipCodes: ["68005", "68123", "68147"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "64K+"
      }
    ]
  },
  nevada: {
    name: 'Nevada',
    areas: [
      {
        city: "Las Vegas",
        zipCodes: ["89101", "89102", "89103", "89104", "89105", "89106", "89107", "89108", "89109", "89110"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "650K+"
      },
      {
        city: "Henderson",
        zipCodes: ["89002", "89011", "89012", "89014", "89015", "89044", "89052", "89074"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "320K+"
      },
      {
        city: "Reno",
        zipCodes: ["89501", "89502", "89503", "89504", "89505", "89506", "89507", "89508", "89509"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "264K+"
      }
    ]
  },
  newhampshire: {
    name: 'New Hampshire',
    areas: [
      {
        city: "Manchester",
        zipCodes: ["03101", "03102", "03103", "03104", "03105", "03109"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "115K+"
      },
      {
        city: "Nashua",
        zipCodes: ["03060", "03062", "03063", "03064"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "91K+"
      },
      {
        city: "Concord",
        zipCodes: ["03301", "03302", "03303"],
        driveTime: "45-60 minutes",
        serviceType: "limited" as const,
        population: "44K+"
      }
    ]
  },
  newjersey: {
    name: 'New Jersey',
    areas: [
      {
        city: "Newark",
        zipCodes: ["07101", "07102", "07103", "07104", "07105", "07106", "07107", "07108", "07109", "07110"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "311K+"
      },
      {
        city: "Jersey City",
        zipCodes: ["07302", "07304", "07305", "07306", "07307", "07310"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "292K+"
      },
      {
        city: "Paterson",
        zipCodes: ["07501", "07502", "07503", "07504", "07505", "07510", "07513", "07514"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "159K+"
      }
    ]
  },
  newmexico: {
    name: 'New Mexico',
    areas: [
      {
        city: "Albuquerque",
        zipCodes: ["87101", "87102", "87103", "87104", "87105", "87106", "87107", "87108", "87109", "87110"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "564K+"
      },
      {
        city: "Las Cruces",
        zipCodes: ["88001", "88003", "88005", "88007", "88011", "88012"],
        driveTime: "60-75 minutes",
        serviceType: "limited" as const,
        population: "111K+"
      },
      {
        city: "Rio Rancho",
        zipCodes: ["87124", "87144"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "104K+"
      }
    ]
  },
  newyork: {
    name: 'New York',
    areas: [
      {
        city: "New York City",
        zipCodes: ["10001", "10002", "10003", "10004", "10005", "10006", "10007", "10008", "10009", "10010"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "8.3M+"
      },
      {
        city: "Buffalo",
        zipCodes: ["14201", "14202", "14203", "14204", "14205", "14206", "14207", "14208", "14209", "14210"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "278K+"
      },
      {
        city: "Rochester",
        zipCodes: ["14601", "14602", "14603", "14604", "14605", "14606", "14607", "14608", "14609", "14610"],
        driveTime: "50-65 minutes",
        serviceType: "full" as const,
        population: "211K+"
      }
    ]
  },
  northcarolina: {
    name: 'North Carolina',
    areas: [
      {
        city: "Charlotte",
        zipCodes: ["28201", "28202", "28203", "28204", "28205", "28206", "28207", "28208", "28209", "28210"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "874K+"
      },
      {
        city: "Raleigh",
        zipCodes: ["27601", "27602", "27603", "27604", "27605", "27606", "27607", "27608", "27609", "27610"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "474K+"
      },
      {
        city: "Greensboro",
        zipCodes: ["27401", "27402", "27403", "27404", "27405", "27406", "27407", "27408", "27409", "27410"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "298K+"
      }
    ]
  },
  northdakota: {
    name: 'North Dakota',
    areas: [
      {
        city: "Fargo",
        zipCodes: ["58101", "58102", "58103", "58104", "58105", "58106", "58107", "58108", "58109", "58122"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "125K+"
      },
      {
        city: "Bismarck",
        zipCodes: ["58501", "58503", "58504", "58505"],
        driveTime: "60-75 minutes",
        serviceType: "limited" as const,
        population: "73K+"
      },
      {
        city: "Grand Forks",
        zipCodes: ["58201", "58202", "58203"],
        driveTime: "45-60 minutes",
        serviceType: "limited" as const,
        population: "59K+"
      }
    ]
  },
  ohio: {
    name: 'Ohio',
    areas: [
      {
        city: "Columbus",
        zipCodes: ["43201", "43202", "43203", "43204", "43205", "43206", "43207", "43208", "43209", "43210"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "898K+"
      },
      {
        city: "Cleveland",
        zipCodes: ["44101", "44102", "44103", "44104", "44105", "44106", "44107", "44108", "44109", "44110"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "383K+"
      },
      {
        city: "Cincinnati",
        zipCodes: ["45201", "45202", "45203", "45204", "45205", "45206", "45207", "45208", "45209", "45210"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "309K+"
      }
    ]
  },
  oklahoma: {
    name: 'Oklahoma',
    areas: [
      {
        city: "Oklahoma City",
        zipCodes: ["73101", "73102", "73103", "73104", "73105", "73106", "73107", "73108", "73109", "73110"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "695K+"
      },
      {
        city: "Tulsa",
        zipCodes: ["74101", "74102", "74103", "74104", "74105", "74106", "74107", "74108", "74110", "74112"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "413K+"
      },
      {
        city: "Norman",
        zipCodes: ["73019", "73026", "73071", "73072"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "128K+"
      }
    ]
  },
  oregon: {
    name: 'Oregon',
    areas: [
      {
        city: "Portland",
        zipCodes: ["97201", "97202", "97203", "97204", "97205", "97206", "97207", "97208", "97209", "97210"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "652K+"
      },
      {
        city: "Salem",
        zipCodes: ["97301", "97302", "97303", "97304", "97305", "97306", "97308", "97309", "97310", "97317"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "178K+"
      },
      {
        city: "Eugene",
        zipCodes: ["97401", "97402", "97403", "97404", "97405", "97408"],
        driveTime: "50-65 minutes",
        serviceType: "full" as const,
        population: "177K+"
      }
    ]
  },
  pennsylvania: {
    name: 'Pennsylvania',
    areas: [
      {
        city: "Philadelphia",
        zipCodes: ["19101", "19102", "19103", "19104", "19105", "19106", "19107", "19108", "19109", "19110"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "1.6M+"
      },
      {
        city: "Pittsburgh",
        zipCodes: ["15201", "15202", "15203", "15204", "15205", "15206", "15207", "15208", "15209", "15210"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "302K+"
      },
      {
        city: "Allentown",
        zipCodes: ["18101", "18102", "18103", "18104", "18105", "18106", "18109"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "125K+"
      }
    ]
  },
  rhodeisland: {
    name: 'Rhode Island',
    areas: [
      {
        city: "Providence",
        zipCodes: ["02901", "02902", "02903", "02904", "02905", "02906", "02907", "02908", "02909"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "190K+"
      },
      {
        city: "Warwick",
        zipCodes: ["02886", "02888", "02889"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "82K+"
      },
      {
        city: "Cranston",
        zipCodes: ["02910", "02920", "02921"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "82K+"
      }
    ]
  },
  southcarolina: {
    name: 'South Carolina',
    areas: [
      {
        city: "Charleston",
        zipCodes: ["29401", "29403", "29405", "29407", "29409", "29412", "29414", "29418"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "150K+"
      },
      {
        city: "Columbia",
        zipCodes: ["29201", "29202", "29203", "29204", "29205", "29206", "29207", "29208", "29209", "29210"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "137K+"
      },
      {
        city: "North Charleston",
        zipCodes: ["29405", "29406", "29418", "29420"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "114K+"
      }
    ]
  },
  southdakota: {
    name: 'South Dakota',
    areas: [
      {
        city: "Sioux Falls",
        zipCodes: ["57101", "57103", "57104", "57105", "57106", "57107", "57108", "57110"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "192K+"
      },
      {
        city: "Rapid City",
        zipCodes: ["57701", "57702", "57703", "57709"],
        driveTime: "60-75 minutes",
        serviceType: "limited" as const,
        population: "76K+"
      },
      {
        city: "Aberdeen",
        zipCodes: ["57401", "57402"],
        driveTime: "75-90 minutes",
        serviceType: "limited" as const,
        population: "28K+"
      }
    ]
  },
  tennessee: {
    name: 'Tennessee',
    areas: [
      {
        city: "Nashville",
        zipCodes: ["37201", "37202", "37203", "37204", "37205", "37206", "37207", "37208", "37209", "37210"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "689K+"
      },
      {
        city: "Memphis",
        zipCodes: ["38101", "38103", "38104", "38105", "38106", "38107", "38108", "38109", "38111", "38112"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "651K+"
      },
      {
        city: "Knoxville",
        zipCodes: ["37901", "37902", "37909", "37912", "37914", "37915", "37916", "37917", "37918", "37919"],
        driveTime: "50-65 minutes",
        serviceType: "full" as const,
        population: "190K+"
      }
    ]
  },
  texas: {
    name: 'Texas',
    areas: [
      {
        city: "Houston",
        zipCodes: ["77001", "77002", "77003", "77004", "77005", "77006", "77007", "77008", "77009", "77010"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "2.3M+"
      },
      {
        city: "San Antonio",
        zipCodes: ["78201", "78202", "78203", "78204", "78205", "78207", "78208", "78209", "78210", "78211"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "1.5M+"
      },
      {
        city: "Dallas",
        zipCodes: ["75201", "75202", "75203", "75204", "75205", "75206", "75207", "75208", "75209", "75210"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "1.3M+"
      }
    ]
  },
  utah: {
    name: 'Utah',
    areas: [
      {
        city: "Salt Lake City",
        zipCodes: ["84101", "84102", "84103", "84104", "84105", "84106", "84107", "84108", "84109", "84110"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "200K+"
      },
      {
        city: "West Valley City",
        zipCodes: ["84119", "84120"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "140K+"
      },
      {
        city: "Provo",
        zipCodes: ["84601", "84604", "84606"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "117K+"
      }
    ]
  },
  vermont: {
    name: 'Vermont',
    areas: [
      {
        city: "Burlington",
        zipCodes: ["05401", "05402", "05403", "05404", "05405", "05406", "05407", "05408"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "44K+"
      },
      {
        city: "Essex",
        zipCodes: ["05451", "05452"],
        driveTime: "35-50 minutes",
        serviceType: "limited" as const,
        population: "22K+"
      },
      {
        city: "South Burlington",
        zipCodes: ["05403"],
        driveTime: "40-55 minutes",
        serviceType: "limited" as const,
        population: "20K+"
      }
    ]
  },
  virginia: {
    name: 'Virginia',
    areas: [
      {
        city: "Virginia Beach",
        zipCodes: ["23451", "23452", "23453", "23454", "23455", "23456", "23457", "23458", "23459", "23460"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "459K+"
      },
      {
        city: "Norfolk",
        zipCodes: ["23501", "23502", "23503", "23504", "23505", "23507", "23508", "23509", "23510", "23511"],
        driveTime: "35-50 minutes",
        serviceType: "full" as const,
        population: "238K+"
      },
      {
        city: "Chesapeake",
        zipCodes: ["23320", "23321", "23322", "23323", "23324", "23325"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "249K+"
      }
    ]
  },
  washington: {
    name: 'Washington',
    areas: [
      {
        city: "Seattle",
        zipCodes: ["98101", "98102", "98103", "98104", "98105", "98106", "98107", "98108", "98109", "98110"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "749K+"
      },
      {
        city: "Spokane",
        zipCodes: ["99201", "99202", "99203", "99204", "99205", "99206", "99207", "99208", "99212", "99216"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "230K+"
      },
      {
        city: "Tacoma",
        zipCodes: ["98401", "98402", "98403", "98404", "98405", "98406", "98407", "98408", "98409", "98411"],
        driveTime: "40-55 minutes",
        serviceType: "full" as const,
        population: "219K+"
      }
    ]
  },
  westvirginia: {
    name: 'West Virginia',
    areas: [
      {
        city: "Charleston",
        zipCodes: ["25301", "25302", "25304", "25309", "25311", "25312", "25313", "25314"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "46K+"
      },
      {
        city: "Huntington",
        zipCodes: ["25701", "25702", "25703", "25704", "25705", "25706"],
        driveTime: "45-60 minutes",
        serviceType: "limited" as const,
        population: "45K+"
      },
      {
        city: "Morgantown",
        zipCodes: ["26501", "26505", "26508"],
        driveTime: "50-65 minutes",
        serviceType: "limited" as const,
        population: "138K+"
      }
    ]
  },
  wisconsin: {
    name: 'Wisconsin',
    areas: [
      {
        city: "Milwaukee",
        zipCodes: ["53201", "53202", "53203", "53204", "53205", "53206", "53207", "53208", "53209", "53210"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "577K+"
      },
      {
        city: "Madison",
        zipCodes: ["53701", "53702", "53703", "53704", "53705", "53706", "53707", "53708", "53711", "53713"],
        driveTime: "45-60 minutes",
        serviceType: "full" as const,
        population: "269K+"
      },
      {
        city: "Green Bay",
        zipCodes: ["54301", "54302", "54303", "54304", "54307", "54311", "54313"],
        driveTime: "50-65 minutes",
        serviceType: "full" as const,
        population: "105K+"
      }
    ]
  },
  wyoming: {
    name: 'Wyoming',
    areas: [
      {
        city: "Cheyenne",
        zipCodes: ["82001", "82006", "82007", "82009", "82010"],
        driveTime: "30-45 minutes",
        serviceType: "full" as const,
        population: "65K+"
      },
      {
        city: "Casper",
        zipCodes: ["82601", "82604", "82605", "82609"],
        driveTime: "60-75 minutes",
        serviceType: "limited" as const,
        population: "59K+"
      },
      {
        city: "Laramie",
        zipCodes: ["82070", "82071", "82072", "82073"],
        driveTime: "45-60 minutes",
        serviceType: "limited" as const,
        population: "32K+"
      }
    ]
  }
};

export default function ServiceAreas() {
  const [location, setLocation] = useLocation();
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Parse URL to get selected state
  const urlParts = location.split('/');
  const stateFromUrl = urlParts[2]; // /service-areas/california
  const currentState = stateFromUrl || selectedState;

  const handleStateClick = (stateKey: string) => {
    setLocation(`/service-areas/${stateKey}`);
  };

  const handleBackToStates = () => {
    setLocation('/service-areas');
  };

  const renderStatesList = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Service Areas
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We provide professional auto glass services across all 48 contiguous US states. 
          Select your state to see detailed coverage areas and cities we serve.
        </p>
      </div>

      {/* Coverage Summary */}
      <div className="max-w-4xl mx-auto p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">Comprehensive Coverage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
          <div><strong>48 States:</strong> All contiguous US states covered</div>
          <div><strong>144 Cities:</strong> 3 major cities per state</div>
          <div><strong>Service Types:</strong> Full service and limited coverage areas</div>
          <div><strong>ZIP Coverage:</strong> Comprehensive ZIP code mapping</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {Object.entries(stateServiceAreas).map(([stateKey, stateData]) => (
          <Card 
            key={stateKey}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300"
            onClick={() => handleStateClick(stateKey)}
            data-testid={`state-card-${stateKey}`}
          >
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-center text-xl">{stateData.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <p className="text-gray-600">
                  {stateData.areas.length} cities served
                </p>
                <div className="flex justify-center">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Full Coverage
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  Click to view details
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

      </div>
    </div>
  );

  const renderStateDetail = () => {
    const stateData = stateServiceAreas[currentState as keyof typeof stateServiceAreas];
    
    if (!stateData) {
      return (
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">State Not Found</h1>
          <p className="text-gray-600 mb-6">The requested state is not available yet.</p>
          <Button onClick={handleBackToStates} data-testid="button-back-to-states">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All States
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={handleBackToStates}
            className="flex items-center gap-2"
            data-testid="button-back-to-states"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All States
          </Button>
          <Badge variant="outline" className="bg-blue-50">
            {stateData.areas.length} Cities
          </Badge>
        </div>

        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {stateData.name} Service Areas
          </h1>
          <p className="text-xl text-gray-600">
            Professional auto glass services across {stateData.name}
          </p>
        </div>

        {/* Service Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stateData.areas.map((area, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200" data-testid={`area-card-${area.city.toLowerCase().replace(' ', '-')}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{area.city}</CardTitle>
                  <Badge 
                    variant={area.serviceType === 'full' ? 'default' : 'secondary'}
                    className={area.serviceType === 'full' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                  >
                    {area.serviceType === 'full' ? 'Full Service' : 'Limited'}
                  </Badge>
                </div>

              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{area.driveTime}</span>
                </div>
                


                <div className="pt-2 border-t">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Car className="w-4 h-4" />
                      Mobile Service
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Same Day
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">Ready to Schedule Service?</h3>
            <p className="text-gray-600 mb-6">
              Get a quote for your location in {stateData.name}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" data-testid="button-get-quote">
                <Star className="w-4 h-4 mr-2" />
                Get Free Quote
              </Button>
              <Button variant="outline" size="lg" data-testid="button-call-now">
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white force-light">
      {/* Header Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2" data-testid="link-home">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EG</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Express Auto Glass</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors" data-testid="nav-home">
                Home
              </Link>
              <Link to="/service-areas" className="text-blue-600 font-medium" data-testid="nav-service-areas">
                Service Areas
              </Link>
              <Link to="/quote" className="text-gray-600 hover:text-gray-900 transition-colors" data-testid="nav-quote">
                Get Quote
              </Link>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" data-testid="button-call-now">
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation('/')}
                data-testid="button-mobile-home"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!currentState ? renderStatesList() : renderStateDetail()}
      </div>
    </div>
  );
}