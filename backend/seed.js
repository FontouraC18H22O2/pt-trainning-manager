require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// 💡 O Prisma deteta automaticamente o process.env.DATABASE_URL da Cloud ou do .env local!
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 A preparar a criação do PT de teste no servidor...');

  const nomePT = 'admin';
  const emailPT = 'admin@gym.com'; 
  const passwordCrua = 'Admin@257-05'; 

  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(passwordCrua, saltRounds);

  // Verificar se o admin já existe para evitar duplicações em re-deploys
  const adminExiste = await prisma.userAdmin.findUnique({
    where: { email: emailPT }
  });

  if (adminExiste) {
    console.log('⚠️ O utilizador administrador já se encontra registado na base de dados.');
    return;
  }

  const ptAcesso = await prisma.userAdmin.create({
    data: {
      nome: nomePT,
      email: emailPT,
      passwordHash: passwordHash,
      role: 'ADMIN', // 🔥 Garante que ele entra com a Role correta definida no teu schema
      isActive: true,
      mustChangePassword: false // Evita bloqueios no primeiro login de teste
    }
  });

  console.log('\n===============================================');
  console.log('✅ PERSONAL TRAINER ADMIN CRIADO COM SUCESSO!');
  console.log(`👤 Nome: ${ptAcesso.nome}`);
  console.log(`📧 Email: ${ptAcesso.email}`);
  console.log(`🔑 Password: ${passwordCrua}`);
  console.log('===============================================');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante a execução do seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });