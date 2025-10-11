export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard General</h1>
      <div className="card">
        <h3>Resumen de Actividad</h3>
        <p>Visualiza el estado general del sistema logístico.</p>
        <div style={{ display: "flex", gap: "20px", marginTop: "15px" }}>
          <div className="card" style={{ flex: 1, textAlign: "center" }}>
            <h4>Envíos Activos</h4>
            <p style={{ fontSize: "1.8rem", color: "#22c55e" }}>24</p>
          </div>
          <div className="card" style={{ flex: 1, textAlign: "center" }}>
            <h4>Almacenes</h4>
            <p style={{ fontSize: "1.8rem", color: "#22c55e" }}>6</p>
          </div>
          <div className="card" style={{ flex: 1, textAlign: "center" }}>
            <h4>Conductores</h4>
            <p style={{ fontSize: "1.8rem", color: "#22c55e" }}>12</p>
          </div>
        </div>
      </div>
    </div>
  );
}
