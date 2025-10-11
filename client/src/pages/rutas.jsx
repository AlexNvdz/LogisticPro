export default function Rutas() {
  return (
    <div>
      <h1>Optimización de Rutas</h1>
      <div className="card">
        <h3>Planificador de Ruta</h3>
        <form style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
          <input type="text" placeholder="Origen" />
          <input type="text" placeholder="Destino" />
          <button type="submit">Calcular</button>
        </form>
      </div>

      <div className="card">
        <h3>Rutas Activas</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID Ruta</th>
              <th>Origen</th>
              <th>Destino</th>
              <th>Distancia</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>R-001</td>
              <td>Bogotá</td>
              <td>Cali</td>
              <td>480 km</td>
              <td>7 h</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
