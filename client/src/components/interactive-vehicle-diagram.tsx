import { useState } from 'react';

// Window mapping from image regions to form values
// Image shows: Windshield, Front Vent, Front Door, Back Door, Rear Vent, Rear Quarter, Back Glass
const WINDOW_MAP = {
  windshield: { label: 'Windshield', formValue: 'windshield' },
  frontVent: { label: 'Front Vent', formValue: 'vent_left' },
  frontDoor: { label: 'Front Door', formValue: 'front_driver' },
  backDoor: { label: 'Back Door', formValue: 'rear_driver' },
  rearVent: { label: 'Rear Vent', formValue: 'vent_right' },
  rearQuarter: { label: 'Rear Quarter', formValue: 'quarter_panel_left' },
  backGlass: { label: 'Back Glass', formValue: 'rear_windshield' },
};

interface InteractiveVehicleDiagramProps {
  selectedWindows: string[];
  onWindowSelect: (windowValue: string, selected: boolean) => void;
}

export function InteractiveVehicleDiagram({ selectedWindows, onWindowSelect }: InteractiveVehicleDiagramProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const handleRegionClick = (region: keyof typeof WINDOW_MAP) => {
    const formValue = WINDOW_MAP[region].formValue;
    const isSelected = selectedWindows.includes(formValue);
    onWindowSelect(formValue, !isSelected);
  };

  const isRegionSelected = (region: keyof typeof WINDOW_MAP) => {
    return selectedWindows.includes(WINDOW_MAP[region].formValue);
  };

  // SVG overlay with clickable regions positioned over the car image
  // Coordinates are approximate based on the image layout
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Base car image */}
      <img
        src="/vehicle-diagram.png"
        alt="Vehicle Glass Parts Selection Diagram"
        className="w-full h-auto"
        draggable={false}
      />

      {/* SVG overlay with clickable regions */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 857 404"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Windshield - front angled window */}
        <polygon
          points="108,85 165,150 165,200 108,175"
          className={`cursor-pointer transition-all duration-200 ${
            isRegionSelected('windshield')
              ? 'fill-blue-500/70 stroke-blue-600 stroke-2'
              : hoveredRegion === 'windshield'
              ? 'fill-red-400/50 stroke-red-500 stroke-2'
              : 'fill-transparent hover:fill-red-300/30'
          }`}
          onClick={() => handleRegionClick('windshield')}
          onMouseEnter={() => setHoveredRegion('windshield')}
          onMouseLeave={() => setHoveredRegion(null)}
        />

        {/* Front Vent - small triangular window */}
        <polygon
          points="175,150 200,150 200,195 175,195"
          className={`cursor-pointer transition-all duration-200 ${
            isRegionSelected('frontVent')
              ? 'fill-blue-500/70 stroke-blue-600 stroke-2'
              : hoveredRegion === 'frontVent'
              ? 'fill-red-400/50 stroke-red-500 stroke-2'
              : 'fill-transparent hover:fill-red-300/30'
          }`}
          onClick={() => handleRegionClick('frontVent')}
          onMouseEnter={() => setHoveredRegion('frontVent')}
          onMouseLeave={() => setHoveredRegion(null)}
        />

        {/* Front Door - main front side window */}
        <polygon
          points="210,100 320,100 320,195 210,195"
          className={`cursor-pointer transition-all duration-200 ${
            isRegionSelected('frontDoor')
              ? 'fill-blue-500/70 stroke-blue-600 stroke-2'
              : hoveredRegion === 'frontDoor'
              ? 'fill-red-400/50 stroke-red-500 stroke-2'
              : 'fill-transparent hover:fill-red-300/30'
          }`}
          onClick={() => handleRegionClick('frontDoor')}
          onMouseEnter={() => setHoveredRegion('frontDoor')}
          onMouseLeave={() => setHoveredRegion(null)}
        />

        {/* Back Door - main rear side window */}
        <polygon
          points="330,100 440,100 440,195 330,195"
          className={`cursor-pointer transition-all duration-200 ${
            isRegionSelected('backDoor')
              ? 'fill-blue-500/70 stroke-blue-600 stroke-2'
              : hoveredRegion === 'backDoor'
              ? 'fill-red-400/50 stroke-red-500 stroke-2'
              : 'fill-transparent hover:fill-red-300/30'
          }`}
          onClick={() => handleRegionClick('backDoor')}
          onMouseEnter={() => setHoveredRegion('backDoor')}
          onMouseLeave={() => setHoveredRegion(null)}
        />

        {/* Rear Vent - small window after back door */}
        <polygon
          points="450,100 485,100 485,170 450,170"
          className={`cursor-pointer transition-all duration-200 ${
            isRegionSelected('rearVent')
              ? 'fill-blue-500/70 stroke-blue-600 stroke-2'
              : hoveredRegion === 'rearVent'
              ? 'fill-red-400/50 stroke-red-500 stroke-2'
              : 'fill-transparent hover:fill-red-300/30'
          }`}
          onClick={() => handleRegionClick('rearVent')}
          onMouseEnter={() => setHoveredRegion('rearVent')}
          onMouseLeave={() => setHoveredRegion(null)}
        />

        {/* Rear Quarter - fixed quarter panel window */}
        <polygon
          points="495,100 560,100 595,170 495,170"
          className={`cursor-pointer transition-all duration-200 ${
            isRegionSelected('rearQuarter')
              ? 'fill-blue-500/70 stroke-blue-600 stroke-2'
              : hoveredRegion === 'rearQuarter'
              ? 'fill-red-400/50 stroke-red-500 stroke-2'
              : 'fill-transparent hover:fill-red-300/30'
          }`}
          onClick={() => handleRegionClick('rearQuarter')}
          onMouseEnter={() => setHoveredRegion('rearQuarter')}
          onMouseLeave={() => setHoveredRegion(null)}
        />

        {/* Back Glass - rear windshield */}
        <polygon
          points="605,85 700,140 700,190 605,175"
          className={`cursor-pointer transition-all duration-200 ${
            isRegionSelected('backGlass')
              ? 'fill-blue-500/70 stroke-blue-600 stroke-2'
              : hoveredRegion === 'backGlass'
              ? 'fill-red-400/50 stroke-red-500 stroke-2'
              : 'fill-transparent hover:fill-red-300/30'
          }`}
          onClick={() => handleRegionClick('backGlass')}
          onMouseEnter={() => setHoveredRegion('backGlass')}
          onMouseLeave={() => setHoveredRegion(null)}
        />
      </svg>

      {/* Hover tooltip */}
      {hoveredRegion && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg">
          Click to {isRegionSelected(hoveredRegion as keyof typeof WINDOW_MAP) ? 'deselect' : 'select'}: {WINDOW_MAP[hoveredRegion as keyof typeof WINDOW_MAP].label}
        </div>
      )}

      {/* Selection indicator */}
      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Click on the red highlighted areas to select windows</p>
        {selectedWindows.length > 0 && (
          <p className="mt-1 text-blue-600 dark:text-blue-400 font-medium">
            {selectedWindows.length} window{selectedWindows.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>
    </div>
  );
}
