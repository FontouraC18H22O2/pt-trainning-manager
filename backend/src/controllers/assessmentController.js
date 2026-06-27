const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

// 🔧 Arredonda para 2 casas decimais de forma segura (evita DECIMAL overflow na BD)
const dec = (val) => val !== undefined && val !== null && val !== '' ? parseFloat(parseFloat(val).toFixed(2)) : null;
const int = (val) => val !== undefined && val !== null && val !== '' ? parseInt(val) : null;

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
        idade: int(idade),
        objetivos: objetivos || null,
        patologias: patologias || null,
        medicamentos: medicamentos || null,
        alcoolTabaco: alcoolTabaco || null,
        experienciaTreino: experienciaTreino || null,
        nivelAtividade: nivelAtividade || null,
        vezesSemana: int(vezesSemana),
        peso: dec(peso),
        altura: dec(altura),
        imc: dec(imc),
        bracoDireitoCm: dec(bracoDireitoCm),
        bracoDireitoPct: dec(bracoDireitoPct),
        bracoDireitoKg: dec(bracoDireitoKg),
        bracoEsquerdoCm: dec(bracoEsquerdoCm),
        bracoEsquerdoPct: dec(bracoEsquerdoPct),
        bracoEsquerdoKg: dec(bracoEsquerdoKg),
        pernaDireitaCm: dec(pernaDireitaCm),
        pernaDireitaPct: dec(pernaDireitaPct),
        pernaDireitaKg: dec(pernaDireitaKg),
        pernaEsquerdaCm: dec(pernaEsquerdaCm),
        pernaEsquerdaPct: dec(pernaEsquerdaPct),
        pernaEsquerdaKg: dec(pernaEsquerdaKg),
        torax: dec(torax),
        cintura: dec(cintura),
        abdomen: dec(abdomen),
        quadril: dec(quadril),
        pctMassaGorda: dec(pctMassaGorda),
        pctAgua: dec(pctAgua),
        idadeMetabolica: int(idadeMetabolica),
        tmb: dec(tmb),
        gorduraVisceral: dec(gorduraVisceral),
        kgMassaMuscular: dec(kgMassaMuscular),
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