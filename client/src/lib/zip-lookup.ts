/**
 * ZIP Code to Coordinates Lookup Utility
 * Uses ZIP code prefixes (first 3 digits) to approximate geographic location
 */

interface Coordinates {
  lat: number;
  lng: number;
}

// ZIP code prefix (first 3 digits) to approximate coordinates
// Covers major US regions - used for distance estimation
const ZIP_PREFIX_COORDINATES: Record<string, Coordinates> = {
  // California (900-961)
  '900': { lat: 34.05, lng: -118.25 }, // Los Angeles
  '901': { lat: 34.05, lng: -118.25 },
  '902': { lat: 33.77, lng: -118.19 }, // Long Beach
  '903': { lat: 33.77, lng: -118.19 },
  '904': { lat: 33.77, lng: -118.19 },
  '905': { lat: 33.77, lng: -118.19 },
  '906': { lat: 34.05, lng: -118.25 },
  '907': { lat: 34.05, lng: -118.25 },
  '908': { lat: 34.05, lng: -118.25 },
  '910': { lat: 34.18, lng: -118.31 }, // Pasadena
  '911': { lat: 34.18, lng: -118.31 },
  '912': { lat: 34.18, lng: -118.31 },
  '913': { lat: 34.18, lng: -118.31 },
  '914': { lat: 34.18, lng: -118.31 },
  '915': { lat: 34.18, lng: -118.31 },
  '916': { lat: 34.18, lng: -118.31 },
  '917': { lat: 34.05, lng: -118.25 },
  '918': { lat: 34.05, lng: -118.25 },
  '919': { lat: 34.42, lng: -118.54 }, // Santa Clarita
  '920': { lat: 32.72, lng: -117.16 }, // San Diego
  '921': { lat: 32.72, lng: -117.16 },
  '922': { lat: 33.00, lng: -117.27 }, // Carlsbad
  '923': { lat: 33.95, lng: -117.40 }, // Riverside
  '924': { lat: 33.95, lng: -117.40 },
  '925': { lat: 33.95, lng: -117.40 },
  '926': { lat: 33.68, lng: -117.83 }, // Irvine
  '927': { lat: 33.68, lng: -117.83 },
  '928': { lat: 33.68, lng: -117.83 },
  '930': { lat: 34.95, lng: -120.44 }, // Santa Barbara
  '931': { lat: 34.95, lng: -120.44 },
  '932': { lat: 34.27, lng: -119.23 }, // Ventura
  '933': { lat: 35.37, lng: -119.02 }, // Bakersfield
  '934': { lat: 34.42, lng: -119.70 }, // Santa Barbara
  '935': { lat: 36.60, lng: -121.89 }, // Monterey
  '936': { lat: 36.97, lng: -122.03 }, // Santa Cruz
  '937': { lat: 36.74, lng: -119.79 }, // Fresno
  '938': { lat: 36.74, lng: -119.79 },
  '939': { lat: 36.33, lng: -119.29 }, // Visalia
  '940': { lat: 37.77, lng: -122.42 }, // San Francisco
  '941': { lat: 37.77, lng: -122.42 },
  '942': { lat: 38.58, lng: -121.49 }, // Sacramento
  '943': { lat: 37.50, lng: -122.25 }, // Palo Alto
  '944': { lat: 37.55, lng: -122.27 }, // San Mateo
  '945': { lat: 37.80, lng: -122.27 }, // Oakland
  '946': { lat: 37.80, lng: -122.27 },
  '947': { lat: 37.87, lng: -122.27 }, // Berkeley
  '948': { lat: 37.87, lng: -122.53 }, // Richmond
  '949': { lat: 37.96, lng: -122.35 }, // San Rafael
  '950': { lat: 37.34, lng: -121.89 }, // San Jose
  '951': { lat: 37.34, lng: -121.89 },
  '952': { lat: 37.50, lng: -121.97 }, // Fremont
  '953': { lat: 37.50, lng: -121.97 },
  '954': { lat: 37.50, lng: -121.97 },
  '955': { lat: 40.80, lng: -124.16 }, // Eureka
  '956': { lat: 38.58, lng: -121.49 }, // Sacramento
  '957': { lat: 38.58, lng: -121.49 },
  '958': { lat: 38.58, lng: -121.49 },
  '959': { lat: 38.44, lng: -122.71 }, // Santa Rosa
  '960': { lat: 40.58, lng: -122.39 }, // Redding
  '961': { lat: 39.53, lng: -119.81 }, // Reno area

  // Texas (750-799)
  '750': { lat: 32.78, lng: -96.80 }, // Dallas
  '751': { lat: 32.78, lng: -96.80 },
  '752': { lat: 32.78, lng: -96.80 },
  '753': { lat: 32.78, lng: -96.80 },
  '754': { lat: 33.21, lng: -97.13 }, // Denton
  '755': { lat: 33.21, lng: -97.13 },
  '756': { lat: 31.55, lng: -97.15 }, // Waco
  '757': { lat: 31.55, lng: -97.15 },
  '758': { lat: 31.76, lng: -106.49 }, // El Paso
  '759': { lat: 31.76, lng: -106.49 },
  '760': { lat: 32.76, lng: -97.33 }, // Fort Worth
  '761': { lat: 32.76, lng: -97.33 },
  '762': { lat: 32.76, lng: -97.33 },
  '763': { lat: 33.44, lng: -94.04 }, // Texarkana
  '764': { lat: 32.35, lng: -95.30 }, // Tyler
  '765': { lat: 32.35, lng: -95.30 },
  '766': { lat: 33.64, lng: -95.55 }, // Paris
  '767': { lat: 33.90, lng: -98.53 }, // Wichita Falls
  '768': { lat: 32.45, lng: -100.41 }, // Abilene
  '769': { lat: 31.46, lng: -100.44 }, // San Angelo
  '770': { lat: 29.76, lng: -95.37 }, // Houston
  '771': { lat: 29.76, lng: -95.37 },
  '772': { lat: 29.76, lng: -95.37 },
  '773': { lat: 29.76, lng: -95.37 },
  '774': { lat: 29.76, lng: -95.37 },
  '775': { lat: 29.76, lng: -95.37 },
  '776': { lat: 30.08, lng: -94.10 }, // Beaumont
  '777': { lat: 30.08, lng: -94.10 },
  '778': { lat: 30.27, lng: -97.74 }, // Austin
  '779': { lat: 30.67, lng: -96.37 }, // Bryan
  '780': { lat: 29.42, lng: -98.49 }, // San Antonio
  '781': { lat: 29.42, lng: -98.49 },
  '782': { lat: 29.42, lng: -98.49 },
  '783': { lat: 27.80, lng: -97.40 }, // Corpus Christi
  '784': { lat: 27.80, lng: -97.40 },
  '785': { lat: 26.20, lng: -98.23 }, // McAllen
  '786': { lat: 30.27, lng: -97.74 }, // Austin
  '787': { lat: 30.27, lng: -97.74 },
  '788': { lat: 29.88, lng: -97.94 }, // San Marcos
  '789': { lat: 29.88, lng: -97.94 },
  '790': { lat: 35.22, lng: -101.83 }, // Amarillo
  '791': { lat: 35.22, lng: -101.83 },
  '792': { lat: 34.40, lng: -103.20 }, // Clovis
  '793': { lat: 33.58, lng: -101.85 }, // Lubbock
  '794': { lat: 33.58, lng: -101.85 },
  '795': { lat: 31.99, lng: -102.08 }, // Midland
  '796': { lat: 31.99, lng: -102.08 },
  '797': { lat: 31.99, lng: -102.08 },
  '798': { lat: 31.76, lng: -106.49 }, // El Paso
  '799': { lat: 31.76, lng: -106.49 },

  // Florida (320-349)
  '320': { lat: 30.33, lng: -81.66 }, // Jacksonville
  '321': { lat: 28.54, lng: -81.38 }, // Orlando
  '322': { lat: 30.33, lng: -81.66 },
  '323': { lat: 28.54, lng: -81.38 },
  '324': { lat: 29.65, lng: -82.32 }, // Gainesville
  '325': { lat: 30.44, lng: -84.28 }, // Tallahassee
  '326': { lat: 29.65, lng: -82.32 },
  '327': { lat: 28.54, lng: -81.38 },
  '328': { lat: 28.54, lng: -81.38 },
  '329': { lat: 28.54, lng: -81.38 },
  '330': { lat: 25.76, lng: -80.19 }, // Miami
  '331': { lat: 25.76, lng: -80.19 },
  '332': { lat: 25.76, lng: -80.19 },
  '333': { lat: 26.12, lng: -80.14 }, // Fort Lauderdale
  '334': { lat: 26.71, lng: -80.05 }, // West Palm Beach
  '335': { lat: 27.95, lng: -82.46 }, // Tampa
  '336': { lat: 27.95, lng: -82.46 },
  '337': { lat: 27.95, lng: -82.46 },
  '338': { lat: 28.04, lng: -82.44 }, // Brandon
  '339': { lat: 26.64, lng: -81.87 }, // Fort Myers
  '340': { lat: 18.47, lng: -66.11 }, // Puerto Rico
  '341': { lat: 26.64, lng: -81.87 },
  '342': { lat: 27.77, lng: -82.64 }, // St. Petersburg
  '343': { lat: 27.77, lng: -82.64 },
  '344': { lat: 29.21, lng: -81.02 }, // Daytona Beach
  '346': { lat: 27.95, lng: -82.46 },
  '347': { lat: 28.54, lng: -81.38 },
  '349': { lat: 26.10, lng: -80.20 }, // Pompano Beach

  // Arizona (850-865)
  '850': { lat: 33.45, lng: -112.07 }, // Phoenix
  '851': { lat: 33.45, lng: -112.07 },
  '852': { lat: 33.45, lng: -112.07 },
  '853': { lat: 33.45, lng: -112.07 },
  '854': { lat: 33.42, lng: -111.83 }, // Mesa
  '855': { lat: 33.42, lng: -111.83 },
  '856': { lat: 33.42, lng: -111.83 },
  '857': { lat: 32.22, lng: -110.97 }, // Tucson
  '858': { lat: 32.22, lng: -110.97 },
  '859': { lat: 34.54, lng: -112.47 }, // Prescott
  '860': { lat: 35.20, lng: -111.65 }, // Flagstaff
  '863': { lat: 36.06, lng: -112.14 }, // Grand Canyon
  '864': { lat: 34.87, lng: -114.00 }, // Lake Havasu
  '865': { lat: 32.73, lng: -114.62 }, // Yuma

  // Nevada (889-898)
  '889': { lat: 36.17, lng: -115.14 }, // Las Vegas
  '890': { lat: 36.17, lng: -115.14 },
  '891': { lat: 36.17, lng: -115.14 },
  '893': { lat: 36.04, lng: -114.98 }, // Henderson
  '894': { lat: 39.53, lng: -119.81 }, // Reno
  '895': { lat: 39.53, lng: -119.81 },
  '896': { lat: 36.17, lng: -115.14 },
  '897': { lat: 39.16, lng: -119.77 }, // Carson City
  '898': { lat: 40.84, lng: -115.76 }, // Elko

  // Colorado (800-816)
  '800': { lat: 39.74, lng: -104.99 }, // Denver
  '801': { lat: 39.74, lng: -104.99 },
  '802': { lat: 39.74, lng: -104.99 },
  '803': { lat: 39.86, lng: -104.67 }, // Aurora
  '804': { lat: 39.74, lng: -104.99 },
  '805': { lat: 40.02, lng: -105.27 }, // Boulder
  '806': { lat: 40.59, lng: -105.08 }, // Fort Collins
  '807': { lat: 40.59, lng: -105.08 },
  '808': { lat: 38.83, lng: -104.82 }, // Colorado Springs
  '809': { lat: 38.83, lng: -104.82 },
  '810': { lat: 38.83, lng: -104.82 },
  '811': { lat: 37.27, lng: -107.88 }, // Durango
  '812': { lat: 38.54, lng: -106.93 }, // Gunnison
  '813': { lat: 37.27, lng: -107.88 },
  '814': { lat: 39.06, lng: -108.55 }, // Grand Junction
  '815': { lat: 39.06, lng: -108.55 },
  '816': { lat: 40.42, lng: -104.71 }, // Greeley

  // New York (100-149)
  '100': { lat: 40.71, lng: -74.01 }, // New York City
  '101': { lat: 40.71, lng: -74.01 },
  '102': { lat: 40.71, lng: -74.01 },
  '103': { lat: 40.64, lng: -74.08 }, // Staten Island
  '104': { lat: 40.64, lng: -74.08 },
  '105': { lat: 40.93, lng: -73.90 }, // Yonkers
  '106': { lat: 40.95, lng: -73.73 }, // White Plains
  '107': { lat: 40.95, lng: -73.73 },
  '108': { lat: 41.03, lng: -73.63 }, // Stamford area
  '109': { lat: 41.06, lng: -73.87 }, // Suffern
  '110': { lat: 40.65, lng: -73.95 }, // Brooklyn
  '111': { lat: 40.65, lng: -73.95 },
  '112': { lat: 40.65, lng: -73.95 },
  '113': { lat: 40.70, lng: -73.85 }, // Queens
  '114': { lat: 40.70, lng: -73.85 },
  '115': { lat: 40.79, lng: -73.13 }, // Long Island
  '116': { lat: 40.79, lng: -73.13 },
  '117': { lat: 40.79, lng: -73.13 },
  '118': { lat: 40.79, lng: -73.13 },
  '119': { lat: 40.79, lng: -73.13 },
  '120': { lat: 42.65, lng: -73.75 }, // Albany
  '121': { lat: 42.65, lng: -73.75 },
  '122': { lat: 42.65, lng: -73.75 },
  '123': { lat: 42.82, lng: -73.94 }, // Schenectady
  '124': { lat: 41.70, lng: -73.92 }, // Poughkeepsie
  '125': { lat: 41.70, lng: -73.92 },
  '126': { lat: 41.70, lng: -73.92 },
  '127': { lat: 41.50, lng: -74.01 }, // Newburgh
  '128': { lat: 44.69, lng: -73.45 }, // Plattsburgh
  '129': { lat: 44.69, lng: -73.45 },
  '130': { lat: 43.05, lng: -76.15 }, // Syracuse
  '131': { lat: 43.05, lng: -76.15 },
  '132': { lat: 43.05, lng: -76.15 },
  '133': { lat: 43.10, lng: -75.23 }, // Utica
  '134': { lat: 43.10, lng: -75.23 },
  '135': { lat: 43.10, lng: -75.23 },
  '136': { lat: 44.00, lng: -75.50 }, // Watertown
  '137': { lat: 42.10, lng: -76.80 }, // Binghamton
  '138': { lat: 42.10, lng: -76.80 },
  '139': { lat: 42.10, lng: -76.80 },
  '140': { lat: 42.89, lng: -78.88 }, // Buffalo
  '141': { lat: 42.89, lng: -78.88 },
  '142': { lat: 42.89, lng: -78.88 },
  '143': { lat: 43.16, lng: -77.61 }, // Rochester
  '144': { lat: 43.16, lng: -77.61 },
  '145': { lat: 43.16, lng: -77.61 },
  '146': { lat: 43.16, lng: -77.61 },
  '147': { lat: 42.44, lng: -76.50 }, // Ithaca
  '148': { lat: 42.09, lng: -79.24 }, // Jamestown
  '149': { lat: 42.09, lng: -79.24 },

  // Illinois (600-629)
  '600': { lat: 41.88, lng: -87.63 }, // Chicago
  '601': { lat: 41.88, lng: -87.63 },
  '602': { lat: 41.88, lng: -87.63 },
  '603': { lat: 41.88, lng: -87.63 },
  '604': { lat: 41.88, lng: -87.63 },
  '605': { lat: 41.88, lng: -87.63 },
  '606': { lat: 41.88, lng: -87.63 },
  '607': { lat: 41.88, lng: -87.63 },
  '608': { lat: 41.88, lng: -87.63 },
  '609': { lat: 42.04, lng: -87.69 }, // Evanston
  '610': { lat: 42.28, lng: -89.09 }, // Rockford
  '611': { lat: 42.28, lng: -89.09 },
  '612': { lat: 42.28, lng: -89.09 },
  '613': { lat: 41.51, lng: -90.58 }, // Rock Island
  '614': { lat: 41.51, lng: -90.58 },
  '615': { lat: 40.69, lng: -89.59 }, // Peoria
  '616': { lat: 40.69, lng: -89.59 },
  '617': { lat: 40.48, lng: -88.99 }, // Bloomington
  '618': { lat: 38.52, lng: -89.99 }, // Belleville
  '619': { lat: 38.52, lng: -89.99 },
  '620': { lat: 39.78, lng: -89.65 }, // Springfield
  '622': { lat: 38.63, lng: -90.20 }, // St. Louis area
  '623': { lat: 40.12, lng: -88.24 }, // Champaign
  '624': { lat: 41.93, lng: -89.07 }, // Dixon
  '625': { lat: 39.78, lng: -89.65 },
  '626': { lat: 39.78, lng: -89.65 },
  '627': { lat: 39.78, lng: -89.65 },
  '628': { lat: 38.30, lng: -88.93 }, // Centralia
  '629': { lat: 37.73, lng: -89.22 }, // Carbondale

  // Georgia (300-319)
  '300': { lat: 33.75, lng: -84.39 }, // Atlanta
  '301': { lat: 33.75, lng: -84.39 },
  '302': { lat: 33.75, lng: -84.39 },
  '303': { lat: 33.75, lng: -84.39 },
  '304': { lat: 33.65, lng: -84.45 }, // College Park
  '305': { lat: 33.95, lng: -84.55 }, // Marietta
  '306': { lat: 33.95, lng: -84.55 },
  '307': { lat: 34.87, lng: -85.29 }, // Chattanooga area
  '308': { lat: 33.47, lng: -81.97 }, // Augusta
  '309': { lat: 33.47, lng: -81.97 },
  '310': { lat: 32.08, lng: -81.09 }, // Savannah
  '311': { lat: 33.75, lng: -84.39 },
  '312': { lat: 32.46, lng: -84.99 }, // Columbus
  '313': { lat: 32.46, lng: -84.99 },
  '314': { lat: 32.84, lng: -83.63 }, // Macon
  '315': { lat: 31.58, lng: -84.16 }, // Albany
  '316': { lat: 31.21, lng: -81.50 }, // Brunswick
  '317': { lat: 31.58, lng: -84.16 },
  '318': { lat: 32.08, lng: -81.09 },
  '319': { lat: 33.75, lng: -84.39 },

  // More state prefixes...
  // Pennsylvania
  '150': { lat: 40.44, lng: -79.99 }, // Pittsburgh
  '151': { lat: 40.44, lng: -79.99 },
  '152': { lat: 40.44, lng: -79.99 },
  '153': { lat: 40.44, lng: -79.99 },
  '154': { lat: 40.44, lng: -79.99 },
  '155': { lat: 40.32, lng: -78.92 }, // Johnstown
  '156': { lat: 40.32, lng: -78.92 },
  '157': { lat: 40.32, lng: -78.92 },
  '158': { lat: 40.51, lng: -78.40 }, // Altoona
  '159': { lat: 40.51, lng: -78.40 },
  '160': { lat: 41.41, lng: -75.66 }, // Scranton
  '161': { lat: 41.41, lng: -75.66 },
  '162': { lat: 41.41, lng: -75.66 },
  '163': { lat: 42.13, lng: -80.09 }, // Erie
  '164': { lat: 42.13, lng: -80.09 },
  '165': { lat: 42.13, lng: -80.09 },
  '166': { lat: 40.27, lng: -76.88 }, // Harrisburg
  '167': { lat: 41.24, lng: -77.00 }, // Williamsport
  '168': { lat: 40.27, lng: -76.88 },
  '169': { lat: 41.00, lng: -76.45 }, // Bloomsburg
  '170': { lat: 40.27, lng: -76.88 },
  '171': { lat: 40.27, lng: -76.88 },
  '172': { lat: 40.04, lng: -76.31 }, // Lancaster
  '173': { lat: 39.96, lng: -76.73 }, // York
  '174': { lat: 39.96, lng: -76.73 },
  '175': { lat: 40.04, lng: -76.31 },
  '176': { lat: 40.34, lng: -75.93 }, // Reading
  '177': { lat: 41.24, lng: -77.00 },
  '178': { lat: 40.61, lng: -75.49 }, // Allentown
  '179': { lat: 40.61, lng: -75.49 },
  '180': { lat: 40.61, lng: -75.49 },
  '181': { lat: 40.61, lng: -75.49 },
  '182': { lat: 40.93, lng: -75.07 }, // Stroudsburg
  '183': { lat: 40.61, lng: -75.49 },
  '184': { lat: 41.41, lng: -75.66 },
  '185': { lat: 41.41, lng: -75.66 },
  '186': { lat: 41.41, lng: -75.66 },
  '187': { lat: 41.24, lng: -76.92 }, // Wilkes-Barre
  '188': { lat: 41.24, lng: -76.92 },
  '189': { lat: 40.00, lng: -75.25 }, // Philadelphia area
  '190': { lat: 39.95, lng: -75.17 }, // Philadelphia
  '191': { lat: 39.95, lng: -75.17 },
  '192': { lat: 39.95, lng: -75.17 },
  '193': { lat: 39.95, lng: -75.17 },
  '194': { lat: 40.12, lng: -75.34 }, // Norristown
  '195': { lat: 40.12, lng: -75.34 },
  '196': { lat: 39.87, lng: -75.42 }, // Chester

  // Ohio
  '430': { lat: 39.96, lng: -83.00 }, // Columbus
  '431': { lat: 39.96, lng: -83.00 },
  '432': { lat: 39.96, lng: -83.00 },
  '433': { lat: 39.96, lng: -83.00 },
  '434': { lat: 40.07, lng: -82.43 }, // Newark
  '435': { lat: 40.77, lng: -82.52 }, // Mansfield
  '436': { lat: 41.50, lng: -81.69 }, // Cleveland
  '437': { lat: 41.24, lng: -81.35 }, // Akron
  '438': { lat: 41.24, lng: -81.35 },
  '439': { lat: 40.80, lng: -81.38 }, // Canton
  '440': { lat: 41.50, lng: -81.69 },
  '441': { lat: 41.50, lng: -81.69 },
  '442': { lat: 41.50, lng: -81.69 },
  '443': { lat: 41.50, lng: -81.69 },
  '444': { lat: 41.10, lng: -81.52 }, // Youngstown
  '445': { lat: 41.10, lng: -80.65 },
  '446': { lat: 40.80, lng: -81.38 },
  '447': { lat: 40.80, lng: -81.38 },
  '448': { lat: 41.24, lng: -81.35 },
  '449': { lat: 41.24, lng: -81.35 },
  '450': { lat: 39.10, lng: -84.51 }, // Cincinnati
  '451': { lat: 39.10, lng: -84.51 },
  '452': { lat: 39.10, lng: -84.51 },
  '453': { lat: 39.76, lng: -84.19 }, // Dayton
  '454': { lat: 39.76, lng: -84.19 },
  '455': { lat: 39.93, lng: -84.20 }, // Springfield
  '456': { lat: 39.33, lng: -82.98 }, // Chillicothe
  '457': { lat: 39.37, lng: -81.35 }, // Parkersburg
  '458': { lat: 39.35, lng: -82.10 }, // Athens

  // Michigan
  '480': { lat: 42.33, lng: -83.05 }, // Detroit
  '481': { lat: 42.33, lng: -83.05 },
  '482': { lat: 42.33, lng: -83.05 },
  '483': { lat: 42.33, lng: -83.05 },
  '484': { lat: 43.01, lng: -83.69 }, // Flint
  '485': { lat: 43.01, lng: -83.69 },
  '486': { lat: 43.42, lng: -83.95 }, // Saginaw
  '487': { lat: 43.42, lng: -83.95 },
  '488': { lat: 42.73, lng: -84.56 }, // Lansing
  '489': { lat: 42.73, lng: -84.56 },
  '490': { lat: 42.29, lng: -85.59 }, // Kalamazoo
  '491': { lat: 42.29, lng: -85.59 },
  '492': { lat: 42.24, lng: -84.40 }, // Jackson
  '493': { lat: 42.96, lng: -85.67 }, // Grand Rapids
  '494': { lat: 42.96, lng: -85.67 },
  '495': { lat: 42.96, lng: -85.67 },
  '496': { lat: 44.76, lng: -85.62 }, // Traverse City
  '497': { lat: 44.76, lng: -85.62 },
  '498': { lat: 46.50, lng: -84.35 }, // Sault Ste. Marie
  '499': { lat: 46.55, lng: -87.40 }, // Marquette

  // Washington
  '980': { lat: 47.61, lng: -122.33 }, // Seattle
  '981': { lat: 47.61, lng: -122.33 },
  '982': { lat: 47.61, lng: -122.33 },
  '983': { lat: 47.61, lng: -122.33 },
  '984': { lat: 47.25, lng: -122.44 }, // Tacoma
  '985': { lat: 47.04, lng: -122.90 }, // Olympia
  '986': { lat: 45.64, lng: -122.67 }, // Portland area
  '988': { lat: 46.60, lng: -120.51 }, // Yakima
  '989': { lat: 46.60, lng: -120.51 },
  '990': { lat: 47.66, lng: -117.43 }, // Spokane
  '991': { lat: 47.66, lng: -117.43 },
  '992': { lat: 47.66, lng: -117.43 },
  '993': { lat: 46.73, lng: -117.00 }, // Pullman
  '994': { lat: 46.28, lng: -119.28 }, // Richland

  // Oregon
  '970': { lat: 45.52, lng: -122.68 }, // Portland
  '971': { lat: 45.52, lng: -122.68 },
  '972': { lat: 45.52, lng: -122.68 },
  '973': { lat: 44.94, lng: -123.03 }, // Salem
  '974': { lat: 44.05, lng: -123.09 }, // Eugene
  '975': { lat: 42.33, lng: -122.87 }, // Medford
  '976': { lat: 43.22, lng: -123.36 }, // Roseburg
  '977': { lat: 44.05, lng: -121.32 }, // Bend
  '978': { lat: 45.85, lng: -119.29 }, // Pendleton
  '979': { lat: 45.85, lng: -119.29 },

  // Additional states with major metros...
  // Tennessee
  '370': { lat: 36.16, lng: -86.78 }, // Nashville
  '371': { lat: 36.16, lng: -86.78 },
  '372': { lat: 36.16, lng: -86.78 },
  '373': { lat: 35.05, lng: -85.31 }, // Chattanooga
  '374': { lat: 35.05, lng: -85.31 },
  '375': { lat: 35.96, lng: -83.92 }, // Knoxville
  '376': { lat: 36.30, lng: -82.35 }, // Johnson City
  '377': { lat: 35.96, lng: -83.92 },
  '378': { lat: 35.96, lng: -83.92 },
  '379': { lat: 35.96, lng: -83.92 },
  '380': { lat: 35.15, lng: -90.05 }, // Memphis
  '381': { lat: 35.15, lng: -90.05 },
  '382': { lat: 35.60, lng: -88.81 }, // Jackson
  '383': { lat: 35.60, lng: -88.81 },
  '384': { lat: 35.75, lng: -86.93 }, // Murfreesboro
  '385': { lat: 35.04, lng: -85.30 },

  // Massachusetts
  '010': { lat: 42.10, lng: -72.59 }, // Springfield
  '011': { lat: 42.10, lng: -72.59 },
  '012': { lat: 42.10, lng: -72.59 },
  '013': { lat: 42.10, lng: -72.59 },
  '014': { lat: 42.27, lng: -71.80 }, // Worcester
  '015': { lat: 42.27, lng: -71.80 },
  '016': { lat: 42.27, lng: -71.80 },
  '017': { lat: 42.46, lng: -71.29 }, // Lowell
  '018': { lat: 42.46, lng: -71.29 },
  '019': { lat: 42.52, lng: -70.89 }, // Lynn
  '020': { lat: 42.36, lng: -71.06 }, // Boston
  '021': { lat: 42.36, lng: -71.06 },
  '022': { lat: 42.36, lng: -71.06 },
  '023': { lat: 42.09, lng: -71.02 }, // Brockton
  '024': { lat: 42.36, lng: -71.06 },
  '025': { lat: 41.70, lng: -70.30 }, // Cape Cod
  '026': { lat: 41.70, lng: -70.30 },
  '027': { lat: 41.64, lng: -70.93 }, // New Bedford

  // More key areas...
  // New Jersey
  '070': { lat: 40.74, lng: -74.17 }, // Newark
  '071': { lat: 40.74, lng: -74.17 },
  '072': { lat: 40.49, lng: -74.45 }, // New Brunswick
  '073': { lat: 40.72, lng: -74.04 }, // Jersey City
  '074': { lat: 40.88, lng: -74.04 }, // Hackensack
  '075': { lat: 40.86, lng: -74.23 }, // Paterson
  '076': { lat: 40.86, lng: -74.23 },
  '077': { lat: 40.73, lng: -74.07 }, // Red Bank
  '078': { lat: 40.73, lng: -74.07 },
  '079': { lat: 40.73, lng: -74.07 },
  '080': { lat: 39.95, lng: -75.12 }, // Camden
  '081': { lat: 39.95, lng: -75.12 },
  '082': { lat: 39.47, lng: -74.26 }, // Atlantic City
  '083': { lat: 39.47, lng: -74.26 },
  '084': { lat: 39.47, lng: -74.26 },
  '085': { lat: 40.22, lng: -74.76 }, // Trenton
  '086': { lat: 40.22, lng: -74.76 },
  '087': { lat: 40.35, lng: -74.07 }, // Long Branch
  '088': { lat: 39.93, lng: -74.88 }, // Moorestown
  '089': { lat: 39.93, lng: -74.88 },
};

/**
 * Get approximate coordinates for a ZIP code using prefix lookup
 * @param zip - Full 5-digit ZIP code
 * @returns Coordinates or null if not found
 */
export function getCoordinatesFromZip(zip: string): Coordinates | null {
  if (!zip || zip.length < 3) return null;

  const prefix = zip.substring(0, 3);
  return ZIP_PREFIX_COORDINATES[prefix] || null;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param coord1 - First coordinate
 * @param coord2 - Second coordinate
 * @returns Distance in miles
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 3959; // Earth's radius in miles

  const lat1Rad = (coord1.lat * Math.PI) / 180;
  const lat2Rad = (coord2.lat * Math.PI) / 180;
  const deltaLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if coordinates are within a service radius
 * @param userCoords - User's coordinates
 * @param serviceCoords - Service location coordinates
 * @param radiusMiles - Service radius in miles
 * @returns Whether user is within service area
 */
export function isWithinServiceArea(
  userCoords: Coordinates,
  serviceCoords: Coordinates,
  radiusMiles: number
): boolean {
  const distance = calculateDistance(userCoords, serviceCoords);
  return distance <= radiusMiles;
}
