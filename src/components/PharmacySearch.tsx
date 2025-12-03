import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Search, Clock, Building2, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Pharmacy {
  name: string;
  location: string;
  phone: string;
  hours: string;
  coordinates: [number, number];
  drugs: string[];
}

const partnerPharmacies: Pharmacy[] = [
  {
    name: "Kigali Pharmacy",
    location: "KN 3 Ave, Kigali",
    phone: "+250 788 123 456",
    hours: "8:00 AM - 9:00 PM",
    coordinates: [-1.9403, 30.0587],
    drugs: ["Metformin", "Ibuprofen", "Paracetamol", "Clomiphene", "Spironolactone", "Oral Contraceptives", "Iron Supplements", "Folic Acid"]
  },
  {
    name: "Nyamirambo Pharmacy",
    location: "KN 72 St, Nyamirambo",
    phone: "+250 788 234 567",
    hours: "7:30 AM - 8:00 PM",
    coordinates: [-1.9756, 30.0453],
    drugs: ["Metformin", "Paracetamol", "Letrozole", "Progesterone", "Vitamin D", "Omega-3", "Tranexamic Acid"]
  },
  {
    name: "Remera Health Pharmacy",
    location: "KG 11 Ave, Remera",
    phone: "+250 788 345 678",
    hours: "8:00 AM - 10:00 PM",
    coordinates: [-1.9567, 30.1127],
    drugs: ["Ibuprofen", "Naproxen", "Gonadotropins", "GnRH Agonists", "Oral Contraceptives", "Calcium", "Magnesium", "Mefenamic Acid"]
  },
  {
    name: "Muhima Pharmacy Plus",
    location: "KN 4 Ave, Muhima",
    phone: "+250 788 456 789",
    hours: "7:00 AM - 9:00 PM",
    coordinates: [-1.9489, 30.0522],
    drugs: ["Metformin", "Clomiphene", "Spironolactone", "Finasteride", "Iron Supplements", "B-Complex Vitamins", "Ulipristal"]
  },
  {
    name: "Kimironko Wellness Pharmacy",
    location: "KG 549 St, Kimironko",
    phone: "+250 788 567 890",
    hours: "8:00 AM - 8:00 PM",
    coordinates: [-1.9389, 30.1289],
    drugs: ["Paracetamol", "Ibuprofen", "Letrozole", "Progesterone", "Folic Acid", "Vitamin D", "Evening Primrose Oil", "Inositol"]
  }
];

const allDrugs = Array.from(new Set(partnerPharmacies.flatMap(p => p.drugs))).sort();

const PharmacySearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>(partnerPharmacies);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-mapbox-token");
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (err) {
        setMapError("Could not load map. Please try again later.");
        console.error("Error fetching mapbox token:", err);
      }
    };
    fetchMapboxToken();
  }, []);

  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [30.0619, -1.9441],
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for filtered pharmacies
    filteredPharmacies.forEach(pharmacy => {
      const el = document.createElement("div");
      el.className = "pharmacy-marker";
      el.style.cssText = `
        width: 32px;
        height: 32px;
        background: hsl(var(--primary));
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([pharmacy.coordinates[1], pharmacy.coordinates[0]])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px;">
              <h3 style="font-weight: bold; margin-bottom: 4px;">${pharmacy.name}</h3>
              <p style="font-size: 12px; color: #666;">${pharmacy.location}</p>
              <p style="font-size: 12px; color: #666;">${pharmacy.phone}</p>
            </div>
          `)
        )
        .addTo(map.current!);

      el.addEventListener("click", () => setSelectedPharmacy(pharmacy));
      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (filteredPharmacies.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredPharmacies.forEach(p => bounds.extend([p.coordinates[1], p.coordinates[0]]));
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  }, [filteredPharmacies, mapboxToken]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredPharmacies(partnerPharmacies);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = partnerPharmacies.filter(pharmacy =>
      pharmacy.drugs.some(drug => drug.toLowerCase().includes(lowerQuery))
    );
    setFilteredPharmacies(filtered);
  };

  const focusOnPharmacy = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    if (map.current) {
      map.current.flyTo({
        center: [pharmacy.coordinates[1], pharmacy.coordinates[0]],
        zoom: 15,
        duration: 1000
      });
    }
  };

  return (
    <div className="mt-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary" />
          Partner Pharmacies in Rwanda
        </h2>
        <p className="text-lg text-muted-foreground">
          Search for your prescribed medication and find pharmacies that have it in stock
        </p>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search for a drug (e.g., Metformin, Clomiphene, Iron Supplements...)"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 py-6 text-base"
          />
        </div>
        {searchQuery && (
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Available drugs:</span>
            {allDrugs.filter(d => d.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5).map(drug => (
              <Badge
                key={drug}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleSearch(drug)}
              >
                {drug}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground mb-4">
          {filteredPharmacies.length} {filteredPharmacies.length === 1 ? "pharmacy" : "pharmacies"} found with "{searchQuery}"
        </p>
      )}

      {/* Map Section */}
      <Card className="mb-6 overflow-hidden">
        {mapError ? (
          <div className="h-64 flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">{mapError}</p>
          </div>
        ) : (
          <div ref={mapContainer} className="h-80 w-full" />
        )}
      </Card>

      {/* Pharmacy List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredPharmacies.length === 0 ? (
          <Card className="p-8 text-center col-span-2">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">No pharmacies found</h3>
            <p className="text-muted-foreground">
              No pharmacies have "{searchQuery}" in stock. Try a different search term.
            </p>
          </Card>
        ) : (
          filteredPharmacies.map((pharmacy, index) => (
            <Card
              key={index}
              className={`p-5 hover:shadow-md transition-all cursor-pointer ${
                selectedPharmacy?.name === pharmacy.name ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => focusOnPharmacy(pharmacy)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold">{pharmacy.name}</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    focusOnPharmacy(pharmacy);
                  }}
                >
                  <Navigation className="w-4 h-4" />
                  View
                </Button>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{pharmacy.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{pharmacy.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{pharmacy.hours}</span>
                </div>
              </div>
              {searchQuery && (
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Matching drugs:</p>
                  <div className="flex flex-wrap gap-1">
                    {pharmacy.drugs
                      .filter(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(drug => (
                        <Badge key={drug} variant="secondary" className="text-xs">
                          {drug}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PharmacySearch;
