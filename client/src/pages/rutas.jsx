import { useState, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer
} from "@react-google-maps/api";

export default function Rutas() {
  const [map, setMap] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originMarker, setOriginMarker] = useState(null);
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [directions, setDirections] = useState(null);
  const [selecting, setSelecting] = useState(null);
  const [info, setInfo] = useState(null);

  const geocoderRef = useRef(null);

  const mapContainerStyle = {
    width: "100%",
    height: "600px",
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
          setInfo({
            origin: leg.start_address,
            destination: leg.end_address,
            distance: leg.distance.text,
            duration: leg.duration.text,
          });
        } else {
          alert("No se pudo calcular la ruta: " + status);
        }
      }
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Planificador de Rutas</h1>

      <div className="mb-3 flex flex-wrap gap-2">
        <input
          type="text"
          value={origin}
          placeholder="Origen"
          readOnly
          className="p-2 border rounded w-64"
        />
        <input
          type="text"
          value={destination}
          placeholder="Destino"
          readOnly
          className="p-2 border rounded w-64"
        />
        <button
          onClick={() => setSelecting("origin")}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Seleccionar origen
        </button>
        <button
          onClick={() => setSelecting("destination")}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Seleccionar destino
        </button>
        <button
          onClick={calculateRoute}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Trazar ruta
        </button>
      </div>

      <LoadScript googleMapsApiKey="AIzaSyAjDjx9KGfKAlRKyvULqRmLQoYJFdkz9W4">
        <GoogleMap
          onLoad={(map) => setMap(map)}
          onClick={handleClick}
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={6}
        >
          {originMarker && <Marker position={originMarker} label="O" />}
          {destinationMarker && <Marker position={destinationMarker} label="D" />}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </LoadScript>

      {info && (
        <div className="bg-white p-3 rounded shadow mt-4">
          <h3 className="font-medium mb-2">Información de la Ruta</h3>
          <p><strong>Origen:</strong> {info.origin}</p>
          <p><strong>Destino:</strong> {info.destination}</p>
          <p><strong>Distancia:</strong> {info.distance}</p>
          <p><strong>Duración:</strong> {info.duration}</p>
        </div>
      )}
    </div>
  );
}
