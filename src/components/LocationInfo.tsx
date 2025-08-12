import React from 'react';
import { MapPin, Users, Wifi, Dumbbell, Coffee, Car, Utensils, Gamepad2, TreePine, Recycle } from 'lucide-react';

const LocationInfo: React.FC = () => {
  return (
    <div className="py-16 bg-white">
      <div className="container-modern">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Images Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img 
                src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" 
                alt="Modern living space"
                className="w-full h-48 object-cover rounded-xl"
              />
              <img 
                src="https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop" 
                alt="Outdoor courtyard"
                className="w-full h-32 object-cover rounded-xl"
              />
            </div>
            <div className="space-y-4 pt-8">
              <img 
                src="https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop" 
                alt="Community kitchen"
                className="w-full h-32 object-cover rounded-xl"
              />
              <img 
                src="https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop" 
                alt="Shared workspace"
                className="w-full h-48 object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Right side - Content */}
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              BROMMA<br />
              FRIENDS
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Life should be an experience. That is exactly what we had in mind when creating Bromma Friends - A 
              community of 144 studios at lively Brommaplan, 17 minutes from the city. A perfect set-up for those 
              who can't wait to meet new people and experience new things.
            </p>
            
          </div>
        </div>

        {/* Shared Areas & Facilities */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Shared Areas & Facilities</h3>
            <p className="text-gray-600 text-lg max-w-4xl mx-auto">
              Spacious, welcoming shared areas of over 1100 sqm with an airy and fully equipped kitchen, living room, lobby, and vibrant 
              co-working space, has been thoughtfully designed for our residents' enjoyment. Best of all, these amenities are completely 
              free to use for all residents.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl bg-muted text-foreground/80 shadow-sm hover:shadow-md transition-transform hover:scale-105">
                <Gamepad2 className="w-8 h-8" />
              </div>
              <p className="text-foreground font-medium">Activity Lounge</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl bg-muted text-foreground/80 shadow-sm hover:shadow-md transition-transform hover:scale-105">
                <div className="w-8 h-8 border-2 border-foreground/60 rounded" />
              </div>
              <p className="text-foreground font-medium">Cinema Room</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl bg-muted text-foreground/80 shadow-sm hover:shadow-md transition-transform hover:scale-105">
                <TreePine className="w-8 h-8" />
              </div>
              <p className="text-foreground font-medium">Courtyard</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl bg-muted text-foreground/80 shadow-sm hover:shadow-md transition-transform hover:scale-105">
                <Wifi className="w-8 h-8" />
              </div>
              <p className="text-foreground font-medium">Co-working Space</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl bg-muted text-foreground/80 shadow-sm hover:shadow-md transition-transform hover:scale-105">
                <Dumbbell className="w-8 h-8" />
              </div>
              <p className="text-foreground font-medium">Gym</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl bg-muted text-foreground/80 shadow-sm hover:shadow-md transition-transform hover:scale-105">
                <div className="w-8 h-8 border-2 border-foreground/60 rounded-full flex items-center justify-center">
                  <div className="w-2 h-6 bg-foreground/60 rounded" />
                </div>
              </div>
              <p className="text-foreground font-medium">Sauna</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl bg-muted text-foreground/80 shadow-sm hover:shadow-md transition-transform hover:scale-105">
                <div className="w-8 h-8 rounded-full border-2 border-foreground/60 flex items-center justify-center">
                  <div className="w-3 h-3 bg-foreground/60 rounded-full" />
                </div>
              </div>
              <p className="text-foreground font-medium">Wellness Zone</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl bg-muted text-foreground/80 shadow-sm hover:shadow-md transition-transform hover:scale-105">
                <Utensils className="w-8 h-8" />
              </div>
              <p className="text-foreground font-medium">Large Kitchen</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl bg-muted text-foreground/80 shadow-sm hover:shadow-md transition-transform hover:scale-105">
                <Users className="w-8 h-8" />
              </div>
              <p className="text-foreground font-medium">Meeting Room</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl bg-muted text-foreground/80 shadow-sm hover:shadow-md transition-transform hover:scale-105">
                <div className="w-8 h-5 border-2 border-foreground/60 rounded" />
              </div>
              <p className="text-foreground font-medium">Living Room</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl bg-muted text-foreground/80 shadow-sm hover:shadow-md transition-transform hover:scale-105">
                <div className="w-8 h-6 border-2 border-foreground/60 rounded-full" />
              </div>
              <p className="text-foreground font-medium">Barbeque</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl bg-muted text-foreground/80 shadow-sm hover:shadow-md transition-transform hover:scale-105">
                <Recycle className="w-8 h-8" />
              </div>
              <p className="text-foreground font-medium">Reuse Station</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationInfo;