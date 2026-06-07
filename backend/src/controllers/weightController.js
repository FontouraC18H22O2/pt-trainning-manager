const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

// 1. Registar uma nova carga (POST)
const logWeight = async (req, res) => {
  try {
    const { studentId, exerciseName, weight, repsDone } = req.body;

    if (!studentId || !exerciseName || weight === undefined) {
      return res.status(400).json({ error: 'Faltam dados obrigatórios para registar a carga.' });
    }

    const newLog = await prisma.weightLog.create({
      data: {
        studentId: parseInt(studentId),
        exerciseName: exerciseName.trim(),
        weight: parseFloat(weight),
        repsDone: repsDone ? parseInt(repsDone) : null
      }
    });

    return res.status(201).json(newLog);
  } catch (error) {
    console.error('❌ Erro ao registar carga:', error);
    return res.status(500).json({ error: 'Erro interno ao salvar o registo de carga.' });
  }
};

// 2. Procurar histórico de um exercício de um aluno (GET)
const getWeightHistory = async (req, res) => {
  try {
    const { studentId, exerciseName } = req.query;

    if (!studentId || !exerciseName) {
      return res.status(400).json({ error: 'studentId e exerciseName são obrigatórios na query.' });
    }

    const history = await prisma.weightLog.findMany({
      where: {
        studentId: parseInt(studentId),
        exerciseName: exerciseName.trim()
      },
      orderBy: {
        createdAt: 'asc' // Ordena do mais antigo para o mais recente para criar a linha do tempo
      }
    });

    return res.status(200).json(history);
  } catch (error) {
    console.error('❌ Erro ao ler histórico de cargas:', error);
    return res.status(500).json({ error: 'Erro interno ao carregar histórico.' });
  }
};

module.exports = {
  logWeight,
  getWeightHistory
};