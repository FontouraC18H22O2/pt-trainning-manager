const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  const partes = authHeader.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Erro no formato do token de autenticação.' });
  }

  const token = partes[1];

  try {
    const verificado = jwt.verify(token, JWT_SECRET);
    
    req.userId = verificado.userId;
    req.userRole = verificado.role;
    
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Sessão expirada ou Token inválido.' });
  }
};

module.exports.checkRole = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({ error: 'Acesso proibido. Nível de acesso não identificado.' });
    }

    const roleFormatado = req.userRole.toUpperCase();
    const listaFormatada = rolesPermitidos.map(r => r.toUpperCase());

    if (!listaFormatada.includes(roleFormatado)) {
      return res.status(403).json({ error: 'Acesso negado. Não tem permissão para executar esta ação.' });
    }

    return next();
  };
};