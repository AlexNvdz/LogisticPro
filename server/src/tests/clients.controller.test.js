// Importamos el controlador que queremos probar
const clientsController = require('../controllers/clientsController');
// Importamos la DB (para mockearla)
const { pool } = require('../db/connection');

// Mockeamos la DB
jest.mock('../db/connection', () => ({
  pool: {
    query: jest.fn(),
  },
}));

// Mockeamos los objetos 'req' y 'res' que usan las funciones
const mockRequest = (params = {}, body = {}) => ({
  params,
  body,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// --- Pruebas Unitarias para clientsController ---
describe('Pruebas Unitarias para clientsController', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- PRUEBA 1 (getAllClients) ---
  it('Debe devolver todos los clientes', async () => {
    const mockClients = [{ id: 1, name: 'Cliente 1' }];
    pool.query.mockResolvedValue({ rows: mockClients });
    
    const req = mockRequest();
    const res = mockResponse();

    await clientsController.getAllClients(req, res);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
    expect(res.json).toHaveBeenCalledWith(mockClients);
  });

  // --- PRUEBA 2 (getClientById - Éxito) ---
  it('Debe devolver un cliente por ID', async () => {
    const mockClient = { id: 1, name: 'Cliente 1' };
    pool.query.mockResolvedValue({ rows: [mockClient] });

    const req = mockRequest({ id: '1' });
    const res = mockResponse();

    await clientsController.getClientById(req, res);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE id=$1'), [1]);
    expect(res.json).toHaveBeenCalledWith(mockClient);
  });

  // --- PRUEBA 3 (getClientById - 404) ---
  it('Debe devolver 404 si el cliente no existe', async () => {
    pool.query.mockResolvedValue({ rows: [] }); // No devuelve nada

    const req = mockRequest({ id: '999' });
    const res = mockResponse();

    await clientsController.getClientById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Client not found' });
  });

  // --- PRUEBA 4 (createClient) ---
  it('Debe crear un cliente', async () => {
    const newClientData = { name: 'Cliente Nuevo', contact_email: 'c@c.com' };
    const createdClient = { id: 2, ...newClientData };
    pool.query.mockResolvedValue({ rows: [createdClient] });

    const req = mockRequest({}, newClientData);
    const res = mockResponse();

    await clientsController.createClient(req, res);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO clients'), expect.any(Array));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(createdClient);
  });
  
  // --- PRUEBA 5 (updateClient) ---
  it('Debe actualizar un cliente', async () => {
    const updatedClient = { id: 1, name: 'Cliente Actualizado' };
    pool.query.mockResolvedValue({ rows: [updatedClient] });

    const req = mockRequest({ id: '1' }, { name: 'Cliente Actualizado' });
    const res = mockResponse();

    await clientsController.updateClient(req, res);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE clients'), expect.any(Array));
    expect(res.json).toHaveBeenCalledWith(updatedClient);
  });

  // --- PRUEBA 6 (deleteClient) ---
  it('Debe eliminar un cliente', async () => {
    // rowCount es lo que usa la función para saber si borró
    pool.query.mockResolvedValue({ rowCount: 1 }); 

    const req = mockRequest({ id: '1' });
    const res = mockResponse();

    await clientsController.deleteClient(req, res);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM clients'), [1]);
    expect(res.json).toHaveBeenCalledWith({ ok: true, deletedId: 1 });
  });

  // --- PRUEBA 7 (GET /:id - ID Malo) ---
  it('Debe devolver 400 si el ID no es un número', async () => {
    const req = mockRequest({ id: 'un-id-malo' }); // ID no numérico
    const res = mockResponse();

    await clientsController.getClientById(req, res);

    expect(pool.query).not.toHaveBeenCalled(); // No debe llamar a la DB
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid id' });
  });

});