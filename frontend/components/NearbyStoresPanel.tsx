"use client";
import { useEffect, useState } from "react";
import { getNearbyStores, StoreResult } from "@/lib/api";
import { MapPin, Star, Navigation, ExternalLink, Loader2, AlertCircle } from "lucide-react";

interface Props {
  componentName: string;
}

export default function NearbyStoresPanel({ componentName }: Props) {
  const [stores, setStores] = useState<StoreResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationDenied, setLocationDenied] = useState(false);

  const fetchStores = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const results = await getNearbyStores(
            componentName,
            pos.coords.latitude,
            pos.coords.longitude
          );
          setStores(results);
        } catch {
          setError("Failed to fetch nearby stores.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLocationDenied(true);
        setError(
          err.code === 1
            ? "Location access denied. Please allow location in browser settings."
            : "Unable to get your location. Try again."
        );
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchStores();
  }, [componentName]);

  if (locationDenied) {
    return (
      <div className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-950/30 border border-yellow-800 rounded-xl p-4">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        Location access denied. Enable location to find nearby stores.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        Finding nearby stores...
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }

  if (stores.length === 0) {
    return <p className="text-gray-500 text-sm">No nearby stores found.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {stores.map((store) => (
        <div key={store.place_id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 bg-cyan-950 rounded-lg flex-shrink-0">
            <MapPin className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-white font-medium text-sm truncate">{store.name}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${store.open_now === true ? "bg-green-950 text-green-400" : store.open_now === false ? "bg-red-950 text-red-400" : "bg-gray-800 text-gray-500"}`}>
                {store.open_now === true ? "Open" : store.open_now === false ? "Closed" : "Unknown"}
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5 truncate">{store.address}</p>
            <div className="flex items-center gap-3 mt-2">
              {store.rating && (
                <span className="flex items-center gap-1 text-yellow-400 text-xs">
                  <Star className="w-3 h-3" /> {store.rating}
                  {store.total_ratings && <span className="text-gray-500">({store.total_ratings})</span>}
                </span>
              )}
              {store.distance_km && (
                <span className="flex items-center gap-1 text-gray-400 text-xs">
                  <Navigation className="w-3 h-3" /> {store.distance_km} km
                </span>
              )}
            </div>
          </div>
          <a
            href={store.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-cyan-400 transition-colors flex-shrink-0"
            title="Open in Google Maps"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      ))}
    </div>
  );
}
