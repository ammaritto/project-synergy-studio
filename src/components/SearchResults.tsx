import React from 'react';
import { ExternalLink } from 'lucide-react';

interface SearchParams {
  startDate: string;
  endDate: string;
  guests: number;
}

interface Rate {
  rateId: number;
  rateName: string;
  currency: string;
  currencySymbol: string;
  totalPrice: number;
  avgNightlyRate: number;
  nights: number;
}

interface Unit {
  buildingId: number;
  buildingName: string;
  inventoryTypeId: number;
  inventoryTypeName: string;
  rates: Rate[];
}

interface SearchResultsProps {
  availability: Unit[];
  hasSearched: boolean;
  confirmedSearchParams: SearchParams;
  onSelectUnit: (unit: Unit, rate: Rate) => void;
  calculateNights: () => number;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  availability,
  hasSearched,
  confirmedSearchParams,
  onSelectUnit,
  calculateNights
}) => {
  const formatCurrency = (amount: number): string => {
    try {
      const num = parseFloat(amount?.toString() || '0') || 0;
      return `${num.toLocaleString('sv-SE')} SEK`;
    } catch (e) {
      return '0 SEK';
    }
  };

  const getPropertyImage = (inventoryTypeId: number): string => {
    const imageMap: { [key: number]: string } = {
      38: 'https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/680a675aca567cd974c649a9_ANG-Studio-ThumbnailComp-min.png',
      11: '/lovable-uploads/f528cfcd-9377-4dad-8f71-2e8ecb9836d9.png',
      10: '/lovable-uploads/27013fda-d438-4fd6-bec3-a1603019cf01.png',
    };
    
    return imageMap[inventoryTypeId] || 'https://via.placeholder.com/400x240/e5e7eb/9ca3af?text=Photo+Coming+Soon';
  };

  const getStudioDetails = (inventoryTypeId: number) => {
    const detailsMap: { [key: number]: any } = {
      10: {
        sqm: 15,
        bathroom: 'Shared',
        kitchen: 'Shared',
        rooms: 1,
        readMoreUrl: 'https://www.allihoopliving.com/listing/studio-bromma-2'
      },
      11: {
        sqm: 20,
        bathroom: 'Private', 
        kitchen: 'Private',
        rooms: 1,
        readMoreUrl: 'https://www.allihoopliving.com/listing/studio-bromma-140-cm-bed'
      }
    };
    
    return detailsMap[inventoryTypeId] || {
      sqm: 15,
      bathroom: 'Shared',
      kitchen: 'Shared', 
      rooms: 1,
      readMoreUrl: '#'
    };
  };

  if (!hasSearched) {
    return null;
  }

  if (availability.length === 0) {
    return (
      <div className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">For these days we are fully booked.</h3>
            <p className="text-gray-600">Try adjusting your search criteria or dates.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="space-y-6">
          {availability.map((unit, index) => {
            const studioDetails = getStudioDetails(unit.inventoryTypeId);
            const rate = unit.rates[0]; // Use first rate
            
            return (
            <div key={`${unit.buildingId}-${unit.inventoryTypeId}-${index}`} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Image */}
                <div className="lg:order-1">
                  <img 
                    src={getPropertyImage(unit.inventoryTypeId)} 
                    alt={unit.inventoryTypeName}
                    className="w-full h-64 lg:h-full object-cover"
                  />
                </div>
                
                {/* Content */}
                <div className="p-8 lg:order-2">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-1">{unit.inventoryTypeName}</h3>
                      <p className="text-gray-600">{unit.buildingName}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(rate.totalPrice)}</div>
                      <div className="text-sm text-gray-600">avg. {formatCurrency(rate.avgNightlyRate)}/night</div>
                    </div>
                  </div>

                  {/* Studio Details */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Studio details</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <img src="https://cdn.prod.website-files.com/5ffc799abc54c384e95bfbf9/67bc361a17072666a6cbbd39_Sqm.svg" alt="Area" className="w-4 h-4" />
                        <span>{studioDetails.sqm} Sqm</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <img src="https://cdn.prod.website-files.com/5ffc799abc54c384e95bfbf9/67bc361a94a2a8db6df5d799_ShowerFull.svg" alt="Bathroom" className="w-4 h-4" />
                        <span>{studioDetails.bathroom}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <img src="https://cdn.prod.website-files.com/5ffc799abc54c384e95bfbf9/67bc36159d792c24da1fbee1_Kitchen.svg" alt="Kitchen" className="w-4 h-4" />
                        <span>{studioDetails.kitchen}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <img src="https://cdn.prod.website-files.com/5ffc799abc54c384e95bfbf9/67bc37969fc4e91319b9c12c_Floorplan.svg" alt="Rooms" className="w-4 h-4" />
                        <span>{studioDetails.rooms} Room</span>
                      </div>
                    </div>
                  </div>

                  {/* Shared Spaces */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Shared Spaces</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <img src="https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/67b88820e5f234b304d019fa_Courtyard.svg" alt="Courtyard" className="w-4 h-4" />
                        <span>Courtyard</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <img src="https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/67b887637909e25b290b20aa_Cinema.svg" alt="Cinema" className="w-4 h-4" />
                        <span>Cinema Room</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <img src="https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/67b8881562fca9481748de55_Coworking.svg" alt="Coworking" className="w-4 h-4" />
                        <span>Co-working Space</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <img src="https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/67b8878163c1592df61938d5_Gym.svg" alt="Gym" className="w-4 h-4" />
                        <span>Gym</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <img src="https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/67b88862542d44b3535ed8c7_Sauna.svg" alt="Sauna" className="w-4 h-4" />
                        <span>Sauna</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <a
                      href={studioDetails.readMoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium flex items-center justify-center gap-2"
                    >
                      Read more
                      <img src="https://cdn.prod.website-files.com/5ffc799abc54c384e95bfbf9/67b2285852654c8e0c082e53_tabOpen2.svg" alt="External link" className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => onSelectUnit(unit, rate)}
                      className="flex-1 bg-primary text-primary-foreground py-3 px-6 rounded-lg hover:opacity-90 transition-opacity font-semibold"
                    >
                      Book Studio
                    </button>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;