import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Search, Clock, Building2, Navigation, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Drug {
  id: string;
  name: string;
  category: string | null;
}

interface InventoryItem {
  drug_id: string;
  quantity: number;
  price_rwf: number | null;
  in_stock: boolean | null;
  drugs: Drug;
}

interface Pharmacy {
  id: string;
  name: string;
  location: string;
  phone: string;
  hours: string;
  latitude: number;
  longitude: number;
  inventory: InventoryItem[];
}

const PharmacySearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Fetch mapbox token
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

  // Fetch pharmacies with inventory
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch drugs
      const { data: drugsData } = await supabase
        .from("drugs")
        .select("id, name, category")
        .order("name");
      
      if (drugsData) setDrugs(drugsData);

      // Fetch pharmacies with their inventory
      const { data: pharmaciesData } = await supabase
        .from("pharmacies")
        .select(`
          id, name, location, phone, hours, latitude, longitude,
          inventory:pharmacy_inventory(
            drug_id, quantity, price_rwf, in_stock,
            drugs(id, name, category)
          )
        `)
        .order("name");
      
      if (pharmaciesData) {
        const formattedPharmacies = pharmaciesData.map(p => ({
          ...p,
          inventory: (p.inventory || []).filter((i: any) => i.drugs)
        })) as Pharmacy[];
        setPharmacies(formattedPharmacies);
        setFilteredPharmacies(formattedPharmacies);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, []);

  // Real-time inventory updates
  useEffect(() => {
    const channel = supabase
      .channel("inventory-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pharmacy_inventory" },
        async (payload) => {
          // Refetch pharmacies on any inventory change
          const { data: pharmaciesData } = await supabase
            .from("pharmacies")
            .select(`
              id, name, location, phone, hours, latitude, longitude,
              inventory:pharmacy_inventory(
                drug_id, quantity, price_rwf, in_stock,
                drugs(id, name, category)
              )
            `)
            .order("name");
          
          if (pharmaciesData) {
            const formattedPharmacies = pharmaciesData.map(p => ({
              ...p,
              inventory: (p.inventory || []).filter((i: any) => i.drugs)
            })) as Pharmacy[];
            setPharmacies(formattedPharmacies);
            // Re-apply filter
            if (searchQuery) {
              handleSearch(searchQuery, formattedPharmacies);
            } else {
              setFilteredPharmacies(formattedPharmacies);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchQuery]);

  // Initialize map
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

  // Update markers
  useEffect(() => {
    if (!map.current) return;

    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    filteredPharmacies.forEach(pharmacy => {
      const inStockCount = pharmacy.inventory.filter(i => i.in_stock).length;
      
      const el = document.createElement("div");
      el.className = "pharmacy-marker";
      el.style.cssText = `
        width: 36px;
        height: 36px;
        background: hsl(var(--primary));
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      `;
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([pharmacy.longitude, pharmacy.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px;">
              <h3 style="font-weight: bold; margin-bottom: 4px;">${pharmacy.name}</h3>
              <p style="font-size: 12px; color: #666;">${pharmacy.location}</p>
              <p style="font-size: 12px; color: #22c55e;">${inStockCount} drugs in stock</p>
            </div>
          `)
        )
        .addTo(map.current!);

      el.addEventListener("click", () => setSelectedPharmacy(pharmacy));
      markers.current.push(marker);
    });

    if (filteredPharmacies.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredPharmacies.forEach(p => bounds.extend([p.longitude, p.latitude]));
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  }, [filteredPharmacies, mapboxToken]);

  const handleSearch = (query: string, pharmacyList = pharmacies) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredPharmacies(pharmacyList);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = pharmacyList.filter(pharmacy =>
      pharmacy.inventory.some(item => 
        item.drugs.name.toLowerCase().includes(lowerQuery) && item.in_stock
      )
    );
    setFilteredPharmacies(filtered);
  };

  const focusOnPharmacy = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    if (map.current) {
      map.current.flyTo({
        center: [pharmacy.longitude, pharmacy.latitude],
        zoom: 15,
        duration: 1000
      });
    }
  };

  const getMatchingDrugs = (pharmacy: Pharmacy) => {
    if (!searchQuery) return [];
    return pharmacy.inventory.filter(item =>
      item.drugs.name.toLowerCase().includes(searchQuery.toLowerCase()) && item.in_stock
    );
  };

  if (loading) {
    return (
      <div className="mt-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary" />
          Partner Pharmacies in Rwanda
        </h2>
        <p className="text-lg text-muted-foreground">
          Search for your prescribed medication and find pharmacies with real-time stock availability
        </p>
        <Badge variant="secondary" className="mt-2">
          <Package className="w-3 h-3 mr-1" />
          Live inventory tracking
        </Badge>
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
            <span className="text-sm text-muted-foreground">Suggestions:</span>
            {drugs
              .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .slice(0, 5)
              .map(drug => (
                <Badge
                  key={drug.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleSearch(drug.name)}
                >
                  {drug.name}
                </Badge>
              ))}
          </div>
        )}
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground mb-4">
          {filteredPharmacies.length} {filteredPharmacies.length === 1 ? "pharmacy has" : "pharmacies have"} "{searchQuery}" in stock
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
              No pharmacies have "{searchQuery}" in stock. Try a different medication.
            </p>
          </Card>
        ) : (
          filteredPharmacies.map((pharmacy) => {
            const matchingDrugs = getMatchingDrugs(pharmacy);
            const totalInStock = pharmacy.inventory.filter(i => i.in_stock).length;
            
            return (
              <Card
                key={pharmacy.id}
                className={`p-5 hover:shadow-md transition-all cursor-pointer ${
                  selectedPharmacy?.id === pharmacy.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => focusOnPharmacy(pharmacy)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{pharmacy.name}</h3>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {totalInStock} drugs in stock
                    </Badge>
                  </div>
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
                {searchQuery && matchingDrugs.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Available:</p>
                    <div className="space-y-1">
                      {matchingDrugs.map(item => (
                        <div key={item.drug_id} className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            {item.drugs.name}
                          </span>
                          <span className="text-muted-foreground">
                            {item.quantity} units • {item.price_rwf ? `RWF ${item.price_rwf.toLocaleString()}` : "Price TBD"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PharmacySearch;
