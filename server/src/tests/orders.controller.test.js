// Importamos el controlador que queremos probar
const ordersController = require('../controllers/ordersController');
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

// --- Pruebas Unitarias para ordersController ---
describe('Pruebas Unitarias para ordersController', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- PRUEBA 1 (getAllOrders) ---
  it('Debe devolver todas las órdenes', async () => {
    const mockOrders = [{ id: 1, tracking_code: '123' }, { id: 2, tracking_code: '456' }];
    pool.query.mockResolvedValue({ rows: mockOrders });
    
    const req = mockRequest();
    const res = mockResponse();

    await ordersController.getAllOrders(req, res);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT o.*, c.name'));
    expect(res.json).toHaveBeenCalledWith(mockOrders);
  });

  // --- PRUEBA 2 (getOrderById - Éxito) ---
  it('Debe devolver una orden por ID', async () => {
    const mockOrder = { id: 1, tracking_code: '123' };
    pool.query.mockResolvedValue({ rows: [mockOrder] });

    const req = mockRequest({ id: '1' });
    const res = mockResponse();

    await ordersController.getOrderById(req, res);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE id=$1'), [1]);
    expect(res.json).toHaveBeenCalledWith(mockOrder);
  });

  // --- PRUEBA 3 (getOrderById - 404) ---
  it('Debe devolver 404 si la orden no existe', async () => {
    pool.query.mockResolvedValue({ rows: [] }); // No devuelve nada

    const req = mockRequest({ id: '999' });
    const res = mockResponse();

    await ordersController.getOrderById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Order not found' });
  });

  // --- PRUEBA 4 (createOrder) ---
  it('Debe crear una orden', async () => {
    const newOrderData = { tracking_code: 'XYZ789', origin: 'Bogotá', destination: 'Cali', client_id: 1 };
    const createdOrder = { id: 3, ...newOrderData, status: 'pending' };
    
    // Mock 1: Comprobación del cliente (devuelve que SÍ existe)
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    // Mock 2: El INSERT de la orden (devuelve la orden creada)
    pool.query.mockResolvedValueOnce({ rows: [createdOrder] });

    const req = mockRequest({}, newOrderData);
    const res = mockResponse();

    await ordersController.createOrder(req, res);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO orders'), expect.any(Array));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(createdOrder);
  });
  
  // --- PRUEBA 5 (updateOrder) ---
  it('Debe actualizar una orden', async () => {
    const updatedOrder = { id: 1, status: 'delivered' };
    pool.query.mockResolvedValue({ rows: [updatedOrder] });

    const req = mockRequest({ id: '1' }, { status: 'delivered' });
    const res = mockResponse();

    await ordersController.updateOrder(req, res);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE orders SET'), expect.any(Array));
    expect(res.json).toHaveBeenCalledWith(updatedOrder);
  });

  // --- PRUEBA 6 (deleteOrder) ---
  it('Debe eliminar una orden', async () => {
    pool.query.mockResolvedValue({ rowCount: 1 }); // rowCount es lo que usa para saber si borró

    const req = mockRequest({ id: '1' });
    const res = mockResponse();

    await ordersController.deleteOrder(req, res);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM orders'), [1]);
    expect(res.json).toHaveBeenCalledWith({ ok: true, deletedId: 1 });
  });

  // --- PRUEBA 7 (GET /:id - ID Malo) ---
  it('Debe devolver 400 si el ID no es un número', async () => {
    const req = mockRequest({ id: 'un-id-malo' }); // ID no numérico
    const res = mockResponse();

    await ordersController.getOrderById(req, res);

    expect(pool.query).not.toHaveBeenCalled(); // No debe llamar a la DB
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid id' });
  });

});