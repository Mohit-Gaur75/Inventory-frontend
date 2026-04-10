import { useState, useEffect, useRef } from "react";
import {
  MapContainer, TileLayer, Marker, Popup,
  Circle, LayersControl, useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAllShops, getNearbyShops } from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Store, Navigation, SlidersHorizontal,
  Layers, Filter, X
} from "lucide-react";
import Loader from "../components/Loader";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const shopIcon   = createIcon("orange");
const userIcon   = createIcon("blue");
const activeIcon = createIcon("red");

const CATEGORY_COLORS = {
  Grocery:        "#f97316",
  Electronics:    "#3b82f6",
  Clothing:       "#8b5cf6",
  Pharmacy:       "#10b981",
  Hardware:       "#6b7280",
  Stationery:     "#f59e0b",
  "Food & Beverage": "#ef4444",
  Other:          "#64748b",
};

const CATEGORIES = [
  "All", "Grocery", "Electronics", "Clothing",
  "Pharmacy", "Hardware", "Stationery", "Food & Beverage", "Other"
];

const FlyTo = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

const RouteDisplay = ({ from, to }) => {
  const map = useMap();
  const routeLayerRef = useRef(null);

  useEffect(() => {
    if (!from || !to) return;
    if (routeLayerRef.current) map.removeLayer(routeLayerRef.current);


    const polyline = L.polyline(
      [[from.lat, from.lng], [to[0], to[1]]],
      { color: "#f97316", weight: 4, opacity: 0.8, dashArray: "10, 5" }
    ).addTo(map);

    routeLayerRef.current = polyline;
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    return () => { if (routeLayerRef.current) map.removeLayer(routeLayerRef.current); };
  }, [from, to, map]);

  return null;
};

const MapView = () => {
  const navigate = useNavigate();
  const [allShops, setAllShops]         = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [maxDistance, setMaxDistance]   = useState(10);
  const [nearbyMode, setNearbyMode]     = useState(false);
  const [mapCenter, setMapCenter]       = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom]           = useState(5);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showRoute, setShowRoute]       = useState(false);
  const [routeTarget, setRouteTarget]   = useState(null);
  const [showFilters, setShowFilters]   = useState(false);
  const [mapLayer, setMapLayer]         = useState("street"); 

  useEffect(() => { fetchAllShops(); }, []);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredShops(allShops);
    } else {
      setFilteredShops(allShops.filter((s) => s.category === selectedCategory));
    }
  }, [selectedCategory, allShops]);

  const fetchAllShops = async () => {
    setLoading(true);
    try {
      const { data } = await getAllShops();
      setAllShops(data);
      setFilteredShops(data);
      if (data.length > 0 && data[0].location?.coordinates) {
        const [lng, lat] = data[0].location.coordinates;
        setMapCenter([lat, lng]);
        setMapZoom(12);
      }
    } catch { setAllShops([]); }
    finally { setLoading(false); }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setUserLocation({ lat, lng });
      setMapCenter([lat, lng]);
      setMapZoom(14);
      setNearbyMode(true);
      try {
        const { data } = await getNearbyShops({ lat, lng, maxDistance });
        setAllShops(data.shops);
      } catch { setAllShops([]); }
    });
  };

  const resetToAll = async () => {
    setNearbyMode(false);
    setUserLocation(null);
    setSelectedShop(null);
    setShowRoute(false);
    setRouteTarget(null);
    await fetchAllShops();
  };

  const handleGetDirections = (shop) => {
    if (!userLocation) {
      alert("Click 'Find Nearby Shops' first to set your location");
      return;
    }
    const [lng, lat] = shop.location.coordinates;
    setRouteTarget([lat, lng]);
    setShowRoute(true);
    setSelectedShop(shop);
  };

  const tileLayers = {
    street: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>',
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri",
    },
    terrain: {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    },
  };

  if (loading) return <Loader text="Loading map..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-stone-800">Shop Map</h1>
            <p className="text-stone-500 text-sm">
              {filteredShops.length} shop{filteredShops.length !== 1 ? "s" : ""}
              {nearbyMode && ` within ${maxDistance} km`}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </p>
          </div>
        </div>

      
        <div className="flex items-center gap-2 flex-wrap">
         
          <div className="flex items-center bg-white border border-stone-200 rounded-xl overflow-hidden">
            {["street", "satellite", "terrain"].map((layer) => (
              <button
                key={layer}
                onClick={() => setMapLayer(layer)}
                className={`px-3 py-2 text-xs font-medium capitalize transition-colors
                  ${mapLayer === layer
                    ? "bg-blue-500 text-white"
                    : "text-stone-500 hover:bg-stone-50"}`}
              >
                {layer}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-sm font-medium transition-colors
              ${showFilters ? "border-orange-400 bg-orange-50 text-orange-600" : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          {nearbyMode && (
            <>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-stone-400" />
                <select value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="px-3 py-2 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none">
                  {[2, 5, 10, 20, 50].map((d) => <option key={d} value={d}>{d} km</option>)}
                </select>
              </div>
              <button onClick={resetToAll}
                className="px-4 py-2 border border-stone-200 text-stone-600 text-sm font-medium rounded-xl hover:bg-stone-50">
                Show All
              </button>
            </>
          )}

          <button onClick={detectLocation}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors
              ${nearbyMode ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
            <Navigation className="w-4 h-4" />
            {nearbyMode ? "Refresh Nearby" : "Find Nearby Shops"}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white border border-stone-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4 text-orange-500" /> Filter by Category
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border
                  ${selectedCategory === cat
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"}`}
              >
                {cat !== "All" && (
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: CATEGORY_COLORS[cat] || "#64748b" }}
                  />
                )}
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {showRoute && selectedShop && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-orange-700">
            <Navigation className="w-4 h-4" />
            <span className="font-medium">
              Showing route to {selectedShop.name}
            </span>
          </div>
          <button
            onClick={() => { setShowRoute(false); setRouteTarget(null); }}
            className="p-1 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-orange-600" />
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-stone-200 shadow-sm" style={{ height: "540px" }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: "100%", width: "100%" }}
            key={`map-${mapLayer}`}
          >
            <TileLayer
              attribution={tileLayers[mapLayer].attribution}
              url={tileLayers[mapLayer].url}
            />

            <FlyTo center={mapCenter} zoom={mapZoom} />

            
            {showRoute && userLocation && routeTarget && (
              <RouteDisplay from={userLocation} to={routeTarget} />
            )}

            
            {userLocation && (
              <>
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                  <Popup>
                    <div style={{ fontWeight: "bold" }}>📍 You are here</div>
                  </Popup>
                </Marker>
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={maxDistance * 1000}
                  pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.05, dashArray: "5,5" }}
                />
              </>
            )}

             {filteredShops.map((shop) => {
              if (!shop.location?.coordinates) return null;
              const [shopLng, shopLat] = shop.location.coordinates;
              const isSelected = selectedShop?._id === shop._id;
              return (
                <Marker
                  key={shop._id}
                  position={[shopLat, shopLng]}
                  icon={isSelected ? activeIcon : shopIcon}
                  eventHandlers={{ click: () => setSelectedShop(shop) }}
                >
                  <Popup>
                    <div style={{ minWidth: "160px", fontFamily: "Arial, sans-serif" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <span style={{
                          display: "inline-block", width: "8px", height: "8px",
                          borderRadius: "50%",
                          backgroundColor: CATEGORY_COLORS[shop.category] || "#64748b",
                        }} />
                        <strong style={{ fontSize: "14px" }}>{shop.name}</strong>
                      </div>
                      <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0" }}>{shop.category}</p>
                      {shop.address?.city && (
                        <p style={{ fontSize: "12px", color: "#9ca3af", margin: "2px 0" }}>
                          {shop.address.city}, {shop.address.state}
                        </p>
                      )}
                      <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => navigate(`/shop/${shop._id}`)}
                          style={{
                            flex: 1, padding: "4px 8px", background: "#f97316",
                            color: "white", border: "none", borderRadius: "6px",
                            fontSize: "11px", fontWeight: "bold", cursor: "pointer",
                          }}
                        >
                          View Shop
                        </button>
                        {userLocation && (
                          <button
                            onClick={() => handleGetDirections(shop)}
                            style={{
                              flex: 1, padding: "4px 8px", background: "#3b82f6",
                              color: "white", border: "none", borderRadius: "6px",
                              fontSize: "11px", fontWeight: "bold", cursor: "pointer",
                            }}
                          >
                            Directions
                          </button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

      
        <div className="lg:col-span-1 space-y-2 overflow-y-auto pr-1" style={{ maxHeight: "540px" }}>
          {filteredShops.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <Store className="w-10 h-10 text-stone-200 mx-auto mb-2" />
              <p className="text-sm">No shops found</p>
            </div>
          ) : filteredShops.map((shop) => (
            <div
              key={shop._id}
              onClick={() => {
                setSelectedShop(shop);
                if (shop.location?.coordinates) {
                  const [lng, lat] = shop.location.coordinates;
                  setMapCenter([lat, lng]);
                  setMapZoom(16);
                }
              }}
              className={`bg-white border rounded-xl p-4 cursor-pointer transition-all hover:shadow-sm
                ${selectedShop?._id === shop._id
                  ? "border-orange-400 bg-orange-50"
                  : "border-stone-200 hover:border-stone-300"}`}
            >
              <div className="flex items-start gap-3">
                
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[shop.category] + "20" }}
                >
                  <Store className="w-4 h-4" style={{ color: CATEGORY_COLORS[shop.category] || "#64748b" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-800 text-sm truncate">{shop.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: CATEGORY_COLORS[shop.category] + "20",
                        color: CATEGORY_COLORS[shop.category] || "#64748b",
                      }}
                    >
                      {shop.category}
                    </span>
                  </div>
                  {shop.address?.city && (
                    <p className="text-xs text-stone-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {shop.address.city}, {shop.address.state}
                    </p>
                  )}
                </div>
              </div>

              {selectedShop?._id === shop._id && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/shop/${shop._id}`); }}
                    className="flex-1 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    View Shop
                  </button>
                  {userLocation && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleGetDirections(shop); }}
                      className="flex-1 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-3 h-3" /> Route
                    </button>
                  )}
                  {shop.phone && (
                    <button
                      onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${shop.phone}`; }}
                      className="py-1.5 px-3 border border-stone-200 text-stone-600 text-xs font-medium rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      📞
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center flex-wrap gap-4 text-xs text-stone-500 bg-white border border-stone-200 rounded-xl px-4 py-3">
        <span className="font-semibold text-stone-600">Map Legend:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-400 inline-block" /> Shop
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Selected Shop
        </span>
        {userLocation && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Your Location
          </span>
        )}
        {showRoute && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-6 border-t-2 border-dashed border-orange-500" /> Route
          </span>
        )}
        <span className="text-stone-400 ml-auto">
          Click marker for details • Click "Directions" for route
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <span key={cat} className="flex items-center gap-1.5 text-xs text-stone-500">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MapView;