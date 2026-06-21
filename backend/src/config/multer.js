const multer = require('multer');

//memoryStorage
// O ficheiro fica disponível em req.file.buffer (em memória, temporariamente)
// para depois ser enviado diretamente para o Cloudinary, sem nunca tocar no disco do Railway.
const storage = multer.memoryStorage();

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