const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

// Inicializa o driver idêntico aos outros controladores do projeto
const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

// 🔍 1. GET - Listar todos os exercícios da biblioteca global
exports.getAllExercises = async (req, res) => {
  try {
    const exercises = await prisma.globalExercise.findMany({
      orderBy: {
        name: 'asc' // Organiza por ordem alfabética (A-Z)
      }
    });

    return res.status(200).json(exercises);
  } catch (error) {
    console.error('Erro ao procurar exercícios:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar a galeria de exercícios neste momento.'
    });
  }
};

// ➕ 2. POST - Criar um novo exercício com Upload de GIF/Foto
exports.createExercise = async (req, res) => {
  try {
    const { name, category } = req.body;

    // Validação básica dos campos de texto obrigatórios
    if (!name || !category) {
      return res.status(400).json({ 
        error: 'Campos em falta', 
        message: 'O nome e a categoria são obrigatórios.' 
      });
    }

    // Validar se o ficheiro foi realmente enviado pelo Multer
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Ficheiro em falta', 
        message: 'Por favor, selecione um GIF ou imagem para o exercício.' 
      });
    }

    // 📂 Construir o URL estático relativo que será guardado na Base de Dados
    // O Express vai servir a pasta 'public/uploads' sob o prefixo '/uploads'
    const gifUrl = `/uploads/exercicios/${req.file.filename}`;

    // Criar o registo no MariaDB usando o Prisma Client
    const newExercise = await prisma.globalExercise.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        gifUrl: gifUrl
      }
    });

    return res.status(201).json({
      message: 'Exercício adicionado à biblioteca com sucesso!',
      exercise: newExercise
    });

  } catch (error) {
    console.error('Erro ao criar exercício:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Ocorreu um erro ao tentar guardar o exercício.'
    });
  }
};