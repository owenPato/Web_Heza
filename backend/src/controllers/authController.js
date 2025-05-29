import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import crypto from 'crypto';
import emailService from '../utils/emailService.js';
import pool from '../config/db.js';


export const register = async (req, res) => {
  try {
    const userData = {
      ...req.body,
      username: req.body.email.split('@')[0]
    };

    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    // ✅ Hashear la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;

    const userId = await User.create(userData);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(500).json({ error: 'Error al crear el usuario' });
    }

    delete user.password;
    res.status(201).json({ user });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    if (user.activo === 0) {
      return res.status(401).json({ error: 'Usuario desactivado' });
    }
    
    const firstCheck = await bcrypt.compare(password, user.password);
    
    let isPasswordValid = firstCheck;
    if (!firstCheck) {
      const firstHash = await bcrypt.hash(password, 10);
      isPasswordValid = await bcrypt.compare(firstHash, user.password);
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    await User.update(user.id, { ultima_conexion: new Date() });
    
    delete user.password;
    
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario admin
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND rol = 'admin'",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Administrador no encontrado" });
    }

    const admin = rows[0];

    if (admin.activo !== 1) {
      return res.status(403).json({ message: "Cuenta desactivada. Contacta al administrador." });
    }

    // 🔐 Validar contraseña de forma estándar
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, rol: admin.rol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Registrar última conexión
    await pool.query("UPDATE users SET ultima_conexion = NOW() WHERE id = ?", [admin.id]);

    res.json({
      message: "Inicio de sesión exitoso",
      token,
      admin: {
        id: admin.id,
        nombre: admin.nombre,
        email: admin.email,
        rol: admin.rol,
        sucursal: admin.sucursal
      }
    });

  } catch (error) {
    console.error("Error en adminLogin:", error);
    res.status(500).json({ error: "Error al iniciar sesión como administrador" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    delete user.password;
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil de usuario' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = {
    ...req.body,
    username: req.body.email.split('@')[0]
  };
    
    delete userData.rol;
    
    await User.update(userId, userData);
    
    const updatedUser = await User.findById(userId);
    
    delete updatedUser.password;
    
    res.json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar perfil de usuario' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }
    
    await User.update(userId, { password: newPassword });
    
    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`Password reset requested for email: ${email}`);
    
    if (!email) {
      return res.status(400).json({ error: 'Correo electrónico requerido' });
    }
    
    const user = await User.findByEmail(email);
    
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.json({ message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña' });
    }
    
    console.log(`User found: ${user.id}, generating reset token`);
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);
    
    await User.update(user.id, {
      reset_token: resetToken,
      reset_token_expiry: resetTokenExpiry
    });
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/admin/reset-password/${resetToken}`;
    console.log(`Reset URL generated: ${resetUrl}`);
    
    try {
      console.log('Sending password reset email...');
      
      await emailService.sendEmail({
        to: email,
        subject: 'Restablecimiento de Contraseña - HEZA',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #263D4F;">HEZA Consultoría</h2>
            </div>
            <h2 style="color: #263D4F; text-align: center;">Restablecimiento de Contraseña</h2>
            <p>Hola ${user.nombre || ''},</p>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #B49C73; color: #263D4F; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
            </div>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">${resetUrl}</p>
            <p>Este enlace expirará en 1 hora.</p>
            <p>Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña permanecerá sin cambios.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>&copy; ${new Date().getFullYear()} HEZA Consultoría. Todos los derechos reservados.</p>
            </div>
          </div>
        `
      });
      
      console.log('Password reset email sent successfully');
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError.message);
    }
    
    res.json({ message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña' });
  } catch (error) {
    console.error('Error en solicitud de restablecimiento de contraseña:', error.message);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, username, email, newPassword } = req.body;
    
    if (!token || !username || !email || !newPassword) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    const user = await User.findByResetToken(token);
    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }
    
    if (user.nombre !== username || user.email !== email) {
      return res.status(400).json({ error: 'La información proporcionada no coincide con nuestros registros' });
    }
    
    const now = new Date();
    if (now > new Date(user.reset_token_expiry)) {
      return res.status(400).json({ error: 'El token ha expirado' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await User.update(user.id, {
      password: hashedPassword,
      reset_token: null,
      reset_token_expiry: null
    });
    
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
};

export const requestClientAccess = async (req, res) => {
  try {
    const { telefono, empresa, email, tipo = 'client',sede_id } = req.body;
    console.log('✅ Sede recibida:', sede_id);
    console.log('✅ req.body completo:', JSON.stringify(req.body, null, 2));

    if (!telefono || !empresa || !email|| !sede_id) {
      return res.status(400).json({ error: 'Empresa, teléfono y correo son obligatorios' });
    }

    const connection = await pool.getConnection();

    try {
      // Verificar si ya existe una solicitud pendiente
      const [existingRequests] = await connection.query(
        'SELECT * FROM solicitudes_acceso WHERE email = ? AND estado = "pendiente"',
        [email]
      );

      if (existingRequests.length > 0) {
        return res.status(400).json({ error: 'Ya existe una solicitud pendiente para este correo.' });
      }

      // Guardar la solicitud
    

      await connection.query(
      'INSERT INTO solicitudes_acceso (tipo, empresa, telefono, email, nombre, sede_id) VALUES (?, ?, ?, ?, ?, ?)',
      [tipo, empresa, telefono, email, empresa, sede_id]
      );


      // Notificar por email (opcional)
      let adminEmail;
      if (sede_id === 1) {
          adminEmail = 'daniela_galindo@heza.com.mx';
      } else if (sede_id === 2) {
          adminEmail = 'gilberto_gonzalez@heza.com.mx';
      } else {
          adminEmail = 'owen_hurtado@heza.com.mx';  // fallback por si no se reconoce
      }

      try {
          await emailService.sendEmail({
              to: adminEmail,
              subject: 'Nueva Solicitud de Acceso de Usuario',
              html: `
                <h1>Nueva Solicitud de Acceso de Usuario</h1>
                <p>Un usuario ha solicitado acceso a la plataforma:</p>
                <ul>
                  <li><strong>Nombre:</strong> ${nombre}</li>
                  <li><strong>Teléfono:</strong> ${telefono}</li>
                  <li><strong>Empresa:</strong> ${empresa}</li>
                  <li><strong>Email:</strong> ${email}</li>
                </ul>
                <p>Por favor, revisa esta solicitud en el panel de administración.</p>
              `
          });
          console.log('✅ Correo enviado correctamente a', adminEmail);
      } catch (emailError) {
          console.error('❗ Error enviando correo:', emailError.message);
          // No lanzamos el error, solo lo registramos para evitar romper
      }

      res.json({
        success: true,
        message: 'Solicitud enviada correctamente. Nos pondremos en contacto contigo pronto.'
      });


    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error al procesar solicitud de cliente:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

export const requestUserAccess = async (req, res) => {
  try {
    const { nombre, telefono, empresa, email, sede_id } = req.body;
    
    if (!nombre || !telefono || !empresa || !email || !sede_id) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    if (!email.endsWith('@heza.com.mx')) {
      return res.status(400).json({ error: 'El correo debe ser corporativo (@heza.com.mx)' });
    }

    
    const connection = await (await import('../config/db.js')).default.getConnection();
    
    try {
      // Verificar si ya existe una solicitud con el mismo email
      const [existingRequests] = await connection.query(
        'SELECT * FROM solicitudes_acceso WHERE email = ? AND estado = "pendiente"',
        [email]
      );
      
      if (existingRequests.length > 0) {
        return res.status(400).json({ error: 'Ya existe una solicitud pendiente con este correo electrónico' });
      }
      
      // Verificar si ya existe un usuario con el mismo email
      const [existingUsers] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'Este correo electrónico ya está registrado en el sistema' });
      }
      console.log('Datos a insertar:', { nombre, empresa, telefono, email, sede_id });

      // Guardar la solicitud en la base de datos
      await connection.query(
        'INSERT INTO solicitudes_acceso (tipo, nombre, empresa, telefono, email, sede_id ) VALUES (?, ?, ?, ?, ?, ?)',
        ['user', nombre, empresa, telefono, email, sede_id]
      );

      
      // Enviar notificación por email al administrador
      const emailService = (await import('../utils/emailService.js')).default;
      let adminEmail;
      if (sede_id === 1) {
          adminEmail = 'daniela_galindo@heza.com.mx';
      } else if (sede_id === 2) {
          adminEmail = 'gilberto_gonzalez@heza.com.mx';
      } else {
          adminEmail = 'owen_hurtado@heza.com.mx';  // fallback por si no se reconoce
      }
      await emailService.sendEmail({
          to: adminEmail,
          subject: 'Nueva Solicitud de Acceso de Usuario',
          html: `
            <h1>Nueva Solicitud de Acceso de Usuario</h1>
            <p>Un usuario ha solicitado acceso a la plataforma:</p>
            <ul>
              <li><strong>Nombre:</strong> ${nombre}</li>
              <li><strong>Teléfono:</strong> ${telefono}</li>
              <li><strong>Empresa:</strong> ${empresa}</li>
              <li><strong>Email:</strong> ${email}</li>
            </ul>
            <p>Por favor, revisa esta solicitud en el panel de administración.</p>
          `
      });      
      res.json({ 
        success: true, 
        message: 'Solicitud enviada correctamente. Nos pondremos en contacto contigo pronto.' 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error al procesar solicitud de usuario:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};