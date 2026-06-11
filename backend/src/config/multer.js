const multer = require('multer');
const path = require('path');

// Configuração do armazenamento do Multer
const storage = multer.diskStorage({
  // 📂 Define o destino físico: backend/public/uploads/exercicios/
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads/exercicios'));
  },
  
  // 🏷️ Define o nome do ficheiro (Evita sobreposições e limpa espaços)
  filename: (req, file, cb) => {
    // Apanha a extensão (.gif, .png, .jpg)
    const ext = path.extname(file.originalname);
    
    // Cria um nome único baseado no Timestamp atual + um número aleatório
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    cb(null, `exercicio-${uniqueSuffix}${ext}`);
  }
});

// Filtro de segurança: Aceitar apenas imagens e GIFs
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de ficheiro inválido. Apenas são permitidos GIFs, JPG ou PNG.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite máximo de 10MB por ficheiro
  }
});

module.exports = upload;