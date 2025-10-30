import { useState } from "react";

export default function Rutas() {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function calcularRuta(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResultado(null);
    try {
      const res = await fetch(`/api/route?origin=${encodeURIComponent(origen)}&destination=${encodeURIComponent(destino)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error calculando ruta");
      setResultado(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Optimización de Rutas</h1>
      <div className="card">
        <h3>Planificador de Ruta</h3>
        <form style={{ display: "flex", gap: "15px", marginTop: "10px" }} onSubmit={calcularRuta}>
          <input
            type="text"
            placeholder="Origen"
            value={origen}
            onChange={e => setOrigen(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Destino"
            value={destino}
            onChange={e => setDestino(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Calculando..." : "Calcular"}
          </button>
        </form>
        {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
        {resultado && (
          <div style={{ marginTop: 20 }}>
            <strong>Origen:</strong> {resultado.origen} <br />
            <strong>Destino:</strong> {resultado.destino} <br />
            <strong>Distancia:</strong> {resultado.distancia} <br />
            <strong>Duración:</strong> {resultado.duracion}
          </div>
        )}
      </div>
    </div>
  );
}
