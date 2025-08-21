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
    const imageMap: {
      [key: number]: string;
    } = {
      38: 'https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/680a675aca567cd974c649a9_ANG-Studio-ThumbnailComp-min.png',
      11: '/lovable-uploads/f528cfcd-9377-4dad-8f71-2e8ecb9836d9.png',
      10: '/lovable-uploads/27013fda-d438-4fd6-bec3-a1603019cf01.png'
    };
    return imageMap[inventoryTypeId] || 'https://via.placeholder.com/400x240/e5e7eb/9ca3af?text=Photo+Coming+Soon';
  };
  const getStudioDetails = (inventoryTypeId: number) => {
    const detailsMap: {
      [key: number]: any;
    } = {
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
    return <div className="py-8 bg-background">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-card rounded-lg shadow-sm p-12 text-center border">
            <div className="mb-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">For these days we are fully booked.</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or dates.</p>
          </div>
        </div>
      </div>;
  }
  return <div className="py-8 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="space-y-6">
          {availability.map((unit, index) => {
          const studioDetails = getStudioDetails(unit.inventoryTypeId);
          const rate = unit.rates[0]; // Use first rate

          return <div key={`${unit.buildingId}-${unit.inventoryTypeId}-${index}`} className="bg-card rounded-xl shadow-sm overflow-hidden border">
              <div className="flex flex-col lg:flex-row">
                {/* Image */}
                <div className="lg:w-80 h-64 lg:h-auto">
                  <img src={getPropertyImage(unit.inventoryTypeId)} alt={unit.inventoryTypeName} className="w-full h-full object-cover" />
                </div>
                
                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start h-full">
                    {/* Left Content */}
                    <div className="flex-1 lg:pr-6">
                      <h3 className="text-xl font-semibold text-foreground mb-1">{unit.inventoryTypeName}</h3>
                      <p className="text-muted-foreground mb-4">{unit.buildingName}</p>

                      {/* Studio Details */}
                      <div className="mb-4">
                        <h4 className="font-medium text-foreground mb-2">Studio details</h4>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <img src="https://cdn.prod.website-files.com/5ffc799abc54c384e95bfbf9/67bc361a17072666a6cbbd39_Sqm.svg" alt="Area" className="w-4 h-4" />
                            <span>{studioDetails.sqm} Sqm</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <img src="https://cdn.prod.website-files.com/5ffc799abc54c384e95bfbf9/67bc361a94a2a8db6df5d799_ShowerFull.svg" alt="Bathroom" className="w-4 h-4" />
                            <span>{studioDetails.bathroom}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <img src="https://cdn.prod.website-files.com/5ffc799abc54c384e95bfbf9/67bc36159d792c24da1fbee1_Kitchen.svg" alt="Kitchen" className="w-4 h-4" />
                            <span>{studioDetails.kitchen}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <img src="https://cdn.prod.website-files.com/5ffc799abc54c384e95bfbf9/67bc37969fc4e91319b9c12c_Floorplan.svg" alt="Rooms" className="w-4 h-4" />
                            <span>{studioDetails.rooms} Room</span>
                          </div>
                        </div>
                      </div>

                      {/* Shared Spaces */}
                      <div className="mb-4">
                        <h4 className="font-medium text-foreground mb-2">Shared Spaces</h4>
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1 text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                            <img src="https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/67b88820e5f234b304d019fa_Courtyard.svg" alt="Courtyard" className="w-3 h-3" />
                            <span>Courtyard</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                            <img src="https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/67b887637909e25b290b20aa_Cinema.svg" alt="Cinema" className="w-3 h-3" />
                            <span>Cinema Room</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                            <img src="https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/67b8881562fca9481748de55_Coworking.svg" alt="Coworking" className="w-3 h-3" />
                            <span>Co-working Space</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                            <img src="https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/67b8878163c1592df61938d5_Gym.svg" alt="Gym" className="w-3 h-3" />
                            <span>Gym</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                            <img src="https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/67b88862542d44b3535ed8c7_Sauna.svg" alt="Sauna" className="w-3 h-3" />
                            <span>Sauna</span>
                          </div>
                        </div>
                      </div>

                      {/* Read More Link */}
                      <a href={studioDetails.readMoreUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-4 py-2">
                        Read more
                        <img src="https://cdn.prod.website-files.com/5ffc799abc54c384e95bfbf9/67b2285852654c8e0c082e53_tabOpen2.svg" alt="External link" className="w-4 h-4" />
                      </a>
                    </div>

                    {/* Right Content - Pricing & Booking */}
                    <div className="lg:w-64 mt-6 lg:mt-0 space-y-3">
                      {unit.rates.map((rate, rateIndex) => (
                        <div key={`${rate.rateId}-${rateIndex}`} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                          <div className="text-right mb-6">
                            <div className="flex items-baseline justify-end gap-1">
                              <span className="text-4xl font-bold text-gray-900">{Math.round(rate.totalPrice)}</span>
                              <span className="text-lg font-medium text-gray-600">SEK</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">avg. {Math.round(rate.avgNightlyRate)} SEK/night</p>
                          </div>
                          
                          <div className="text-sm text-gray-500 mb-6 text-center">
                            <div>{rate.nights} {rate.nights === 1 ? 'night' : 'nights'}</div>
                          </div>

                          <button
                            onClick={() => onSelectUnit(unit, rate)}
                            className="w-full bg-yellow-400 text-black py-3 px-4 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
                          >
                            Book Studio
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>;
        })}
        </div>
      </div>
    </div>;
};
export default SearchResults;