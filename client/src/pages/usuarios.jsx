export default function Almacenes() {
  return (
    <div>
      <h1>Gestión de Almacenes</h1>
      <button>+ Nuevo Almacén</button>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Ciudad</th>
              <th>Capacidad</th>
              <th>Responsable</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A-01</td>
              <td>Central Norte</td>
              <td>Bogotá</td>
              <td>85%</td>
              <td>Laura Pérez</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
