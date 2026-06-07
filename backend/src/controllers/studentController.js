const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

// 1. Criar um novo aluno (POST)
const createStudent = async (req, res) => {
  try {
    // 🔥 CORREÇÃO: Ler o que o Frontend (React) realmente envia
    const { nome, whatsapp, status } = req.body; 

    if (!nome || !whatsapp) {
      return res.status(400).json({ error: 'O nome completo e o número de telemóvel são obrigatórios.' });
    }

    // Grava no MySQL usando os nomes do teu schema.prisma
    const newStudent = await prisma.student.create({
      data: { 
        fullName: nome, 
        phoneNumber: whatsapp,
        status: status || 'Ativo'
      }
    });

    // Devolve formatado em português para o Frontend injetar na tabela imediatamente
    return res.status(201).json({ 
      id: newStudent.id,
      nome: newStudent.fullName,
      whatsapp: newStudent.phoneNumber,
      plano: 'Plano Personalizado',
      status: newStudent.status
    });
  } catch (error) {
    console.error('❌ Erro no terminal ao criar aluno:', error);
    return res.status(500).json({ error: 'Erro interno ao registar o aluno.' });
  }
};

// 2. Listar todos os alunos (GET)
const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Mapeia para o formato que a tabela visual espera
    const formatados = students.map(s => ({
      id: s.id,
      nome: s.fullName,
      whatsapp: s.phoneNumber,
      plano: 'Plano Personalizado', 
      status: s.status
    }));

    return res.status(200).json(formatados);
  } catch (error) {
    console.error('❌ Erro no terminal ao listar alunos:', error);
    return res.status(500).json({ error: 'Erro interno ao procurar alunos.' });
  }
};

// 3. Atualizar dados de um aluno (PUT)
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    // 🔥 CORREÇÃO: Mapear os campos recebidos em português para a atualização
    const { nome, whatsapp, status } = req.body; 

    const studentId = parseInt(id);
    if (isNaN(studentId)) {
      return res.status(400).json({ error: 'ID do aluno inválido.' });
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: { 
        fullName: nome, 
        phoneNumber: whatsapp,
        status: status
      }
    });

    // Devolve as chaves traduzidas de volta para o React atualizar a linha da tabela
    return res.status(200).json({ 
      id: updatedStudent.id,
      nome: updatedStudent.fullName,
      whatsapp: updatedStudent.phoneNumber,
      plano: 'Plano Personalizado',
      status: updatedStudent.status
    });
  } catch (error) {
    console.error('❌ Erro no terminal ao atualizar aluno:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Aluno não encontrado.' });
    }
    return res.status(500).json({ error: 'Erro interno ao atualizar o aluno.' });
  }
};

// 4. Remover um aluno (DELETE)
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = parseInt(id);

    if (isNaN(studentId)) {
      return res.status(400).json({ error: 'ID do aluno inválido.' });
    }

    await prisma.student.delete({
      where: { id: studentId }
    });

    return res.status(200).json({ message: 'Aluno removido do sistema com sucesso.' });
  } catch (error) {
    console.error('❌ Erro no terminal ao remover aluno:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Aluno não encontrado.' });
    }
    return res.status(500).json({ error: 'Erro interno ao remover o aluno.' });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  updateStudent,
  deleteStudent
};