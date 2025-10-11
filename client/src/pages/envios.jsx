export default function Envios() {
  return (
    <div>
      <h1>Gestión de Envíos</h1>
      <button>+ Nuevo Envío</button>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Destino</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#001</td>
              <td>Juan Pérez</td>
              <td>Bogotá</td>
              <td>Pendiente</td>
              <td>2025-10-08</td>
            </tr>
            <tr>
              <td>#002</td>
              <td>María Gómez</td>
              <td>Medellín</td>
              <td>En tránsito</td>
              <td>2025-10-07</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
