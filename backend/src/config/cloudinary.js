const cloudinary = require('cloudinary').v2;

// As credenciais vêm das variáveis de ambiente configuradas no Railway:
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Função auxiliar: faz upload de um buffer (ficheiro em memória) para o Cloudinary
// e devolve uma Promise com o resultado (incluindo o secure_url e o public_id)
const uploadBufferToCloudinary = (buffer, folder = 'pt-control/exercicios') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image', // Funciona tanto para imagens como GIFs
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

//Função auxiliar: apaga um ficheiro do Cloudinary a partir do seu public_id
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Erro ao apagar ficheiro do Cloudinary:', error);
  }
};

module.exports = {
  cloudinary,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
};