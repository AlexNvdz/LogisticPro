import { useState, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer
} from "@react-google-maps/api";
import '../styles/rutas.css';

export default function Rutas() {
  const [map, setMap] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originMarker, setOriginMarker] = useState(null);
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [directions, setDirections] = useState(null);
  const [selecting, setSelecting] = useState(null);
  const [info, setInfo] = useState(null);
  const [routes, setRoutes] = useState([]);

  const geocoderRef = useRef(null);

  const mapContainerStyle = {
    width: "100%",
    height: "500px",
    borderRadius: "0.75rem",
  };

  const center = { lat: 4.6097, lng: -74.0817 }; // Bogotá

  const handleClick = (e) => {
    if (!selecting) return;
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ location: e.latLng }, (results, status) => {
      if (status === "OK" && results[0]) {
        const address = results[0].formatted_address;

        if (selecting === "origin") {
          setOrigin(address);
          setOriginMarker(e.latLng);
        } else if (selecting === "destination") {
          setDestination(address);
          setDestinationMarker(e.latLng);
        }

        setSelecting(null);
      }
    });
  };

  const calculateRoute = async () => {
    if (!originMarker || !destinationMarker) {
      alert("Selecciona origen y destino en el mapa");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: originMarker,
        destination: destinationMarker,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === "OK") {
          setDirections(response);
          const leg = response.routes[0].legs[0];
          
          const routeInfo = {
            origin: leg.start_address,
            destination: leg.end_address,
            distance: leg.distance.text,
            distance_value: leg.distance.value,
            duration: leg.duration.text,
            duration_value: leg.duration.value,
            id: Date.now()
          };
          
          setInfo(routeInfo);
          setRoutes(prev => [routeInfo, ...prev]);
        } else {
          alert("No se pudo calcular la ruta: " + status);
        }
      }
    );
  };

  const clearRoute = () => {
    setOrigin("");
    setDestination("");
    setOriginMarker(null);
    setDestinationMarker(null);
    setDirections(null);
    setInfo(null);
    setSelecting(null);
  };

  const deleteRoute = (id) => {
    setRoutes(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="rutas-container">
      {/* Header Section */}
      <div className="rutas-header">
        <div className="header-left">
          <h1 className="page-title">Planificador de Rutas</h1>
          <p className="page-subtitle">Calcula y visualiza rutas de envío en tiempo real</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="rutas-content-grid">
        {/* Left Panel - Controls */}
        <div className="rutas-panel">
          <div className="panel-section">
            <h3 className="section-title">Selecciona Ubicaciones</h3>
            
            <div className="location-inputs">
              <div className="location-field">
                <label className="location-label">
                  <span className="location-icon">📍</span>
                  Origen
                </label>
                <input
                  type="text"
                  value={origin}
                  placeholder="Haz clic en 'Seleccionar origen'"
                  readOnly
                  className="location-input"
                />
                <button
                  onClick={() => setSelecting("origin")}
                  className={`btn-select ${selecting === "origin" ? "active" : ""}`}
                >
                  <span className="btn-select-icon">📌</span>
                  {selecting === "origin" ? "Selecciona en el mapa" : "Seleccionar origen"}
                </button>
              </div>

              <div className="location-field">
                <label className="location-label">
                  <span className="location-icon">🎯</span>
                  Destino
                </label>
                <input
                  type="text"
                  value={destination}
                  placeholder="Haz clic en 'Seleccionar destino'"
                  readOnly
                  className="location-input"
                />
                <button
                  onClick={() => setSelecting("destination")}
                  className={`btn-select ${selecting === "destination" ? "active" : ""}`}
                >
                  <span className="btn-select-icon">📌</span>
                  {selecting === "destination" ? "Selecciona en el mapa" : "Seleccionar destino"}
                </button>
              </div>
            </div>

            <div className="button-group">
              <button
                onClick={calculateRoute}
                disabled={!originMarker || !destinationMarker}
                className="btn-calculate"
              >
                <span className="btn-icon">🛣️</span>
                Trazar Ruta
              </button>
              <button
                onClick={clearRoute}
                className="btn-clear"
              >
                <span className="btn-icon">🔄</span>
                Limpiar
              </button>
            </div>
          </div>

          {/* Route Info Card */}
          {info && (
            <div className="route-info-card">
              <h3 className="info-title">Información de la Ruta</h3>
              
              <div className="info-row">
                <div className="info-item">
                  <span className="info-label">Distancia</span>
                  <span className="info-value distance">{info.distance}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Duración</span>
                  <span className="info-value duration">{info.duration}</span>
                </div>
              </div>

              <div className="info-detail">
                <span className="detail-label">Origen:</span>
                <span className="detail-value">{info.origin}</span>
              </div>

              <div className="info-detail">
                <span className="detail-label">Destino:</span>
                <span className="detail-value">{info.destination}</span>
              </div>

              <div className="info-actions">
                <button className="btn-save-route">
                  <span>💾</span> Guardar Ruta
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="map-container">
          <div className="map-header">
            {selecting && (
              <div className="map-status">
                <span className="status-icon">📍</span>
                <span className="status-text">
                  {selecting === "origin" ? "Selecciona el origen en el mapa" : "Selecciona el destino en el mapa"}
                </span>
              </div>
            )}
          </div>
          
          <LoadScript googleMapsApiKey="AIzaSyAjDjx9KGfKAlRKyvULqRmLQoYJFdkz9W4">
            <GoogleMap
              onLoad={(map) => setMap(map)}
              onClick={handleClick}
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={6}
            >
              {originMarker && (
                <Marker 
                  position={originMarker} 
                  title="Origen"
                  icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                />
              )}
              {destinationMarker && (
                <Marker 
                  position={destinationMarker} 
                  title="Destino"
                  icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                />
              )}
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>

      {/* Routes History Table */}
      {routes.length > 0 && (
        <div className="routes-history">
          <h2 className="history-title">Rutas Calculadas</h2>
          <div className="table-card">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Origen</th>
                    <th>Destino</th>
                    <th>Distancia</th>
                    <th>Duración</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route, index) => (
                    <tr key={route.id} className="table-row">
                      <td className="cell-number">
                        <span className="number-badge">{index + 1}</span>
                      </td>
                      <td className="cell-origin">
                        <span className="location-tag">
                          {route.origin.split(',')[0]}
                        </span>
                      </td>
                      <td className="cell-destination">
                        <span className="location-tag">
                          {route.destination.split(',')[0]}
                        </span>
                      </td>
                      <td className="cell-distance">
                        <span className="distance-badge">{route.distance}</span>
                      </td>
                      <td className="cell-duration">
                        <span className="duration-badge">{route.duration}</span>
                      </td>
                      <td className="cell-actions">
                        <button
                          onClick={() => deleteRoute(route.id)}
                          className="action-btn delete-btn"
                          title="Eliminar ruta"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
