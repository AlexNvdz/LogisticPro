const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'user'; // por defecto

    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
      [name, email, hashedPassword, role]
    );

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};
