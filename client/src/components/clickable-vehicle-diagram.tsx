import { useState } from 'react';

interface ClickableVehicleDiagramProps {
  selectedWindows: string[];
  onWindowToggle: (windowValue: string, selected: boolean) => void;
}

// Glass regions matching the labeled car diagram (side view)
// Labels: Windshield, Front Vent, Front Door, Back Door, Rear Vent, Rear Quarter, Back Glass
const GLASS_REGIONS = [
  { id: 'windshield', label: 'Windshield', formValue: 'windshield' },
  { id: 'front-vent', label: 'Front Vent', formValue: 'front_vent' },
  { id: 'front-door', label: 'Front Door', formValue: 'front_door' },
  { id: 'back-door', label: 'Back Door', formValue: 'back_door' },
  { id: 'rear-vent', label: 'Rear Vent', formValue: 'rear_vent' },
  { id: 'rear-quarter', label: 'Rear Quarter', formValue: 'rear_quarter' },
  { id: 'back-glass', label: 'Back Glass', formValue: 'back_glass' },
];

export function ClickableVehicleDiagram({ selectedWindows, onWindowToggle }: ClickableVehicleDiagramProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const isSelected = (regionId: string) => {
    const region = GLASS_REGIONS.find(r => r.id === regionId);
    return region ? selectedWindows.includes(region.formValue) : false;
  };

  const handleClick = (regionId: string) => {
    const region = GLASS_REGIONS.find(r => r.id === regionId);
    if (region) {
      onWindowToggle(region.formValue, !isSelected(regionId));
    }
  };

  const getLabel = (regionId: string) => {
    const region = GLASS_REGIONS.find(r => r.id === regionId);
    return region?.label || regionId;
  };

  const getGlassStyle = (regionId: string) => {
    const selected = isSelected(regionId);
    const hovered = hoveredRegion === regionId;

    if (selected) {
      return 'fill-blue-500 stroke-blue-700 stroke-[3] cursor-pointer';
    }
    if (hovered) {
      return 'fill-red-400/80 stroke-red-600 stroke-[2] cursor-pointer';
    }
    return 'fill-red-300/60 stroke-red-400 stroke-[1.5] cursor-pointer hover:fill-red-400/70';
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Labeled Vehicle Diagram - Side view showing all glass types */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 320" className="w-full h-auto">
        {/* Background */}
        <rect width="860" height="320" fill="#f8fafc"/>

        {/* Car Body - Silver/Gray sedan (side view) */}
        <g id="car-body">
          {/* Main body */}
          <path
            d="M120 220 L120 180 L180 180 L220 120 L640 120 L680 180 L740 180 L740 220 L680 220 L680 240 L160 240 L160 220 Z"
            fill="#d1d5db"
            stroke="#9ca3af"
            strokeWidth="2"
          />

          {/* Roof line */}
          <path
            d="M220 120 L250 85 L590 85 L640 120"
            fill="#b8bfc9"
            stroke="#9ca3af"
            strokeWidth="2"
          />

          {/* Lower body accent */}
          <path
            d="M140 220 L140 200 L720 200 L720 220"
            fill="#a1a1aa"
            stroke="#9ca3af"
            strokeWidth="1"
          />

          {/* Front bumper */}
          <path
            d="M120 180 L100 185 L100 210 L120 220"
            fill="#d1d5db"
            stroke="#9ca3af"
            strokeWidth="2"
          />

          {/* Rear bumper */}
          <path
            d="M740 180 L760 185 L760 210 L740 220"
            fill="#d1d5db"
            stroke="#9ca3af"
            strokeWidth="2"
          />

          {/* Door lines */}
          <line x1="350" y1="120" x2="350" y2="200" stroke="#9ca3af" strokeWidth="1"/>
          <line x1="500" y1="120" x2="500" y2="200" stroke="#9ca3af" strokeWidth="1"/>
        </g>

        {/* Wheels */}
        <g id="wheels">
          <circle cx="200" cy="240" r="40" fill="#374151" stroke="#1f2937" strokeWidth="3"/>
          <circle cx="200" cy="240" r="25" fill="#6b7280"/>
          <circle cx="200" cy="240" r="8" fill="#374151"/>

          <circle cx="660" cy="240" r="40" fill="#374151" stroke="#1f2937" strokeWidth="3"/>
          <circle cx="660" cy="240" r="25" fill="#6b7280"/>
          <circle cx="660" cy="240" r="8" fill="#374151"/>
        </g>

        {/* Clickable Glass Regions (red tint like the reference image) */}

        {/* Windshield - Front angled glass */}
        <path
          id="windshield"
          d="M222 118 L252 87 L295 87 L295 118 Z"
          className={getGlassStyle('windshield')}
          onClick={() => handleClick('windshield')}
          onMouseEnter={() => setHoveredRegion('windshield')}
          onMouseLeave={() => setHoveredRegion(null)}
        />

        {/* Front Vent - Small triangular window near A-pillar */}
        <path
          id="front-vent"
          d="M297 87 L297 118 L320 118 L320 100 Z"
          className={getGlassStyle('front-vent')}
          onClick={() => handleClick('front-vent')}
          onMouseEnter={() => setHoveredRegion('front-vent')}
          onMouseLeave={() => setHoveredRegion(null)}
        />

        {/* Front Door - Main front door window */}
        <path
          id="front-door"
          d="M322 87 L322 175 L348 175 L348 87 Z"
          className={getGlassStyle('front-door')}
          onClick={() => handleClick('front-door')}
          onMouseEnter={() => setHoveredRegion('front-door')}
          onMouseLeave={() => setHoveredRegion(null)}
        />

        {/* Back Door - Rear door window */}
        <path
          id="back-door"
          d="M352 87 L352 175 L498 175 L498 87 Z"
          className={getGlassStyle('back-door')}
          onClick={() => handleClick('back-door')}
          onMouseEnter={() => setHoveredRegion('back-door')}
          onMouseLeave={() => setHoveredRegion(null)}
        />

        {/* Rear Vent - Small window behind back door */}
        <path
          id="rear-vent"
          d="M502 87 L502 150 L540 150 L540 87 Z"
          className={getGlassStyle('rear-vent')}
          onClick={() => handleClick('rear-vent')}
          onMouseEnter={() => setHoveredRegion('rear-vent')}
          onMouseLeave={() => setHoveredRegion(null)}
        />

        {/* Rear Quarter - Fixed quarter panel glass */}
        <path
          id="rear-quarter"
          d="M544 87 L544 165 L588 165 L588 87 Z"
          className={getGlassStyle('rear-quarter')}
          onClick={() => handleClick('rear-quarter')}
          onMouseEnter={() => setHoveredRegion('rear-quarter')}
          onMouseLeave={() => setHoveredRegion(null)}
        />

        {/* Back Glass - Rear windshield (angled) */}
        <path
          id="back-glass"
          d="M590 87 L590 118 L638 118 L620 87 Z"
          className={getGlassStyle('back-glass')}
          onClick={() => handleClick('back-glass')}
          onMouseEnter={() => setHoveredRegion('back-glass')}
          onMouseLeave={() => setHoveredRegion(null)}
        />

        {/* Labels with lines pointing to each glass region */}
        <g id="labels" className="select-none pointer-events-none">
          {/* Windshield label */}
          <text x="150" y="50" fontFamily="Arial, sans-serif" fontSize="12" fill="#1f2937" fontWeight="600">Windshield</text>
          <line x1="195" y1="53" x2="260" y2="85" stroke="#374151" strokeWidth="1"/>

          {/* Front Vent label */}
          <text x="265" y="35" fontFamily="Arial, sans-serif" fontSize="12" fill="#1f2937" fontWeight="600">Front Vent</text>
          <line x1="305" y1="38" x2="308" y2="85" stroke="#374151" strokeWidth="1"/>

          {/* Front Door label */}
          <text x="340" y="50" fontFamily="Arial, sans-serif" fontSize="12" fill="#1f2937" fontWeight="600">Front Door</text>
          <line x1="375" y1="53" x2="335" y2="85" stroke="#374151" strokeWidth="1"/>

          {/* Back Door label */}
          <text x="415" y="35" fontFamily="Arial, sans-serif" fontSize="12" fill="#1f2937" fontWeight="600">Back Door</text>
          <line x1="445" y1="38" x2="425" y2="85" stroke="#374151" strokeWidth="1"/>

          {/* Rear Vent label */}
          <text x="515" y="50" fontFamily="Arial, sans-serif" fontSize="12" fill="#1f2937" fontWeight="600">Rear Vent</text>
          <line x1="545" y1="53" x2="520" y2="85" stroke="#374151" strokeWidth="1"/>

          {/* Rear Quarter label */}
          <text x="600" y="35" fontFamily="Arial, sans-serif" fontSize="12" fill="#1f2937" fontWeight="600">Rear Quarter</text>
          <line x1="645" y1="38" x2="565" y2="85" stroke="#374151" strokeWidth="1"/>

          {/* Back Glass label */}
          <text x="700" y="50" fontFamily="Arial, sans-serif" fontSize="12" fill="#1f2937" fontWeight="600">Back Glass</text>
          <line x1="710" y1="53" x2="615" y2="95" stroke="#374151" strokeWidth="1"/>
        </g>
      </svg>

      {/* Hover tooltip */}
      {hoveredRegion && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg z-10">
          Click to {isSelected(hoveredRegion) ? 'deselect' : 'select'}: {getLabel(hoveredRegion)}
        </div>
      )}

      {/* Instructions */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
        Click on the highlighted glass areas to select them for service
      </p>

      {/* Selection summary */}
      {selectedWindows.length > 0 && (
        <div className="text-center mt-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
            {selectedWindows.length} glass area{selectedWindows.length > 1 ? 's' : ''} selected
          </span>
        </div>
      )}

      {/* Selected items list */}
      {selectedWindows.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {selectedWindows.map(window => {
            const region = GLASS_REGIONS.find(r => r.formValue === window);
            return region ? (
              <span
                key={window}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs font-medium cursor-pointer hover:bg-blue-600"
                onClick={() => onWindowToggle(window, false)}
              >
                {region.label}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
