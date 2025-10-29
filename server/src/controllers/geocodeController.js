// server/src/controllers/geocodeController.js
const fetch = require('node-fetch');

async function getAddressFromCoordinates(req, res) {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Faltan parámetros lat o lng' });
    }

    const GOOGLE_API_KEY = 'AIzaSyAjDjx9KGfKAlRKyvULqRmLQoYJFdkz9W4';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ error: 'No se encontraron resultados' });
    }

    res.json({
      address: data.results[0].formatted_address,
      raw: data
    });
  } catch (error) {
    console.error('Error en geocode:', error);
    res.status(500).json({ error: 'Error al consultar Google Maps' });
  }
}

module.exports = {
  getAddressFromCoordinates
};
