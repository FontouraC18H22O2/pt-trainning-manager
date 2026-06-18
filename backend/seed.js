require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// 💡 Em produção na nuvem, inicializa-se o Prisma de forma limpa, sem adaptadores manuais
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 A preparar a criação do PT de teste no Railway...');

  const nomePT = 'admin';
  const emailPT = 'admin@gym.com'; 
  const passwordCrua = 'Admin@257-05'; 

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(passwordCrua, saltRounds);

  // Verificar se o admin já existe para não duplicar dados se correr mais que uma vez
  const adminExiste = await prisma.userAdmin.findUnique({
    where: { email: emailPT }
  });

  if (adminExiste) {
    console.log('⚠️ O utilizador administrador já se encontra registado.');
    return;
  }

  // Criar o utilizador de acordo com os campos reais do teu schema
  const ptAcesso = await prisma.userAdmin.create({
    data: {
      nome: nomePT,
      email: emailPT,
      passwordHash: passwordHash,
      role: 'ADMIN', 
      isActive: true,
      mustChangePassword: false
    }
  });

  console.log('\n===============================================');
  console.log('✅ PERSONAL TRAINER ADMIN CRIADO COM SUCESSO!');
  console.log(`👤 Nome: ${ptAcesso.nome}`);
  console.log(`📧 Email: ${ptAcesso.email}`);
  console.log(`🔑 Password: ${passwordCrua}`);
  console.log('===============================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro crítico ao executar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });