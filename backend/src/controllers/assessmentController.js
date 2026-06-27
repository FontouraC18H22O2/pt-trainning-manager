const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

// 🔧 Converte campos Decimal do Prisma para Number simples
const formatarAvaliacao = (a) => {
  if (!a) return null;
  const campos = ['peso','altura','imc','bracoDireitoCm','bracoDireitoPct','bracoDireitoKg','bracoEsquerdoCm','bracoEsquerdoPct','bracoEsquerdoKg','pernaDireitaCm','pernaDireitaPct','pernaDireitaKg','pernaEsquerdaCm','pernaEsquerdaPct','pernaEsquerdaKg','torax','cintura','abdomen','quadril','pctMassaGorda','pctAgua','tmb','gorduraVisceral','kgMassaMuscular'];
  const resultado = { ...a };
  campos.forEach(campo => {
    if (resultado[campo] !== null && resultado[campo] !== undefined) {
      resultado[campo] = parseFloat(resultado[campo]);
    }
  });
  return resultado;
};

// ─────────────────────────────────────────────
// 1. LISTAR AVALIAÇÕES DE UM ALUNO (histórico)
// ─────────────────────────────────────────────
const getAssessmentsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const id = parseInt(studentId);
    const ptId = req.userId;

    if (isNaN(id)) return res.status(400).json({ error: 'ID do aluno inválido.' });

    const aluno = await prisma.student.findUnique({ where: { id } });
    if (!aluno || aluno.userAdminId !== ptId) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    const avaliacoes = await prisma.physicalAssessment.findMany({
      where: { studentId: id, userAdminId: ptId },
      orderBy: { assessmentDate: 'desc' }
    });

    return res.status(200).json(avaliacoes.map(formatarAvaliacao));
  } catch (error) {
    console.error('❌ Erro ao listar avaliações:', error.message);
    return res.status(500).json({ error: 'Erro interno ao carregar avaliações.' });
  }
};

// ─────────────────────────────────────────────
// 2. CRIAR NOVA AVALIAÇÃO
// ─────────────────────────────────────────────
const createAssessment = async (req, res) => {
  try {
    const { studentId } = req.params;
    const id = parseInt(studentId);
    const ptId = req.userId;

    if (isNaN(id)) return res.status(400).json({ error: 'ID do aluno inválido.' });

    const aluno = await prisma.student.findUnique({ where: { id } });
    if (!aluno || aluno.userAdminId !== ptId) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    const {
      assessmentDate, profissao, sexo, idade, objetivos, patologias,
      medicamentos, alcoolTabaco, experienciaTreino, nivelAtividade, vezesSemana,
      peso, altura, imc,
      bracoDireitoCm, bracoDireitoPct, bracoDireitoKg,
      bracoEsquerdoCm, bracoEsquerdoPct, bracoEsquerdoKg,
      pernaDireitaCm, pernaDireitaPct, pernaDireitaKg,
      pernaEsquerdaCm, pernaEsquerdaPct, pernaEsquerdaKg,
      torax, cintura, abdomen, quadril,
      pctMassaGorda, pctAgua, idadeMetabolica, tmb, gorduraVisceral, kgMassaMuscular
    } = req.body;

    const novaAvaliacao = await prisma.physicalAssessment.create({
      data: {
        studentId: id,
        userAdminId: ptId,
        assessmentDate: assessmentDate ? new Date(assessmentDate) : new Date(),
        profissao: profissao || null,
        sexo: sexo || null,
        idade: idade ? parseInt(idade) : null,
        objetivos: objetivos || null,
        patologias: patologias || null,
        medicamentos: medicamentos || null,
        alcoolTabaco: alcoolTabaco || null,
        experienciaTreino: experienciaTreino || null,
        nivelAtividade: nivelAtividade || null,
        vezesSemana: vezesSemana ? parseInt(vezesSemana) : null,
        peso: peso ? parseFloat(peso) : null,
        altura: altura ? parseFloat(altura) : null,
        imc: imc ? parseFloat(imc) : null,
        bracoDireitoCm: bracoDireitoCm ? parseFloat(bracoDireitoCm) : null,
        bracoDireitoPct: bracoDireitoPct ? parseFloat(bracoDireitoPct) : null,
        bracoDireitoKg: bracoDireitoKg ? parseFloat(bracoDireitoKg) : null,
        bracoEsquerdoCm: bracoEsquerdoCm ? parseFloat(bracoEsquerdoCm) : null,
        bracoEsquerdoPct: bracoEsquerdoPct ? parseFloat(bracoEsquerdoPct) : null,
        bracoEsquerdoKg: bracoEsquerdoKg ? parseFloat(bracoEsquerdoKg) : null,
        pernaDireitaCm: pernaDireitaCm ? parseFloat(pernaDireitaCm) : null,
        pernaDireitaPct: pernaDireitaPct ? parseFloat(pernaDireitaPct) : null,
        pernaDireitaKg: pernaDireitaKg ? parseFloat(pernaDireitaKg) : null,
        pernaEsquerdaCm: pernaEsquerdaCm ? parseFloat(pernaEsquerdaCm) : null,
        pernaEsquerdaPct: pernaEsquerdaPct ? parseFloat(pernaEsquerdaPct) : null,
        pernaEsquerdaKg: pernaEsquerdaKg ? parseFloat(pernaEsquerdaKg) : null,
        torax: torax ? parseFloat(torax) : null,
        cintura: cintura ? parseFloat(cintura) : null,
        abdomen: abdomen ? parseFloat(abdomen) : null,
        quadril: quadril ? parseFloat(quadril) : null,
        pctMassaGorda: pctMassaGorda ? parseFloat(pctMassaGorda) : null,
        pctAgua: pctAgua ? parseFloat(pctAgua) : null,
        idadeMetabolica: idadeMetabolica ? parseInt(idadeMetabolica) : null,
        tmb: tmb ? parseFloat(tmb) : null,
        gorduraVisceral: gorduraVisceral ? parseFloat(gorduraVisceral) : null,
        kgMassaMuscular: kgMassaMuscular ? parseFloat(kgMassaMuscular) : null,
      }
    });

    return res.status(201).json({
      message: 'Avaliação física guardada com sucesso!',
      assessment: formatarAvaliacao(novaAvaliacao)
    });
  } catch (error) {
    console.error('❌ Erro ao criar avaliação:', error.message);
    return res.status(500).json({ error: 'Erro interno ao guardar avaliação.' });
  }
};

// ─────────────────────────────────────────────
// 3. APAGAR AVALIAÇÃO
// ─────────────────────────────────────────────
const deleteAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const id = parseInt(assessmentId);
    const ptId = req.userId;

    const avaliacao = await prisma.physicalAssessment.findUnique({ where: { id } });
    if (!avaliacao) return res.status(404).json({ error: 'Avaliação não encontrada.' });
    if (avaliacao.userAdminId !== ptId) return res.status(403).json({ error: 'Acesso negado.' });

    await prisma.physicalAssessment.delete({ where: { id } });
    return res.status(200).json({ message: 'Avaliação eliminada com sucesso.' });
  } catch (error) {
    console.error('❌ Erro ao apagar avaliação:', error.message);
    return res.status(500).json({ error: 'Erro interno ao apagar avaliação.' });
  }
};

// ─────────────────────────────────────────────
// 4. AVALIAÇÕES PÚBLICAS (para a página do aluno via WhatsApp)
// ─────────────────────────────────────────────
const getPublicAssessments = async (req, res) => {
  try {
    const { studentId } = req.params;
    const id = parseInt(studentId);

    if (isNaN(id)) return res.status(400).json({ error: 'ID do aluno inválido.' });

    const avaliacoes = await prisma.physicalAssessment.findMany({
      where: { studentId: id },
      orderBy: { assessmentDate: 'desc' }
    });

    return res.status(200).json(avaliacoes.map(formatarAvaliacao));
  } catch (error) {
    console.error('❌ Erro ao carregar avaliações públicas:', error.message);
    return res.status(500).json({ error: 'Erro interno.' });
  }
};

module.exports = {
  getAssessmentsByStudent,
  createAssessment,
  deleteAssessment,
  getPublicAssessments
};