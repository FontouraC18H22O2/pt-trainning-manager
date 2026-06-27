const whatsappService = {
  // 🔥 NOVO: Gera mensagem simples com link para a página do aluno (por studentId)
  gerarTextoMensagem: (studentName, exercises, generalNotes, studentId) => {
    const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'https://pt-control.fit';

    let mensagem = `*Olá, ${studentName}!* 👋\n\n`;
    mensagem += `O teu plano de treino está pronto e disponível no link abaixo.\n\n`;
    mensagem += `No link vais ter acesso ao teu *plano de treino completo* (todos os dias) juntamente com o resultado da tua *avaliação física atual* e futuras para comparação de resultados.\n\n`;
    mensagem += `🔗 *Acede aqui ao teu plano:*\n`;
    mensagem += `${FRONTEND_URL}/meutreino/${studentId}\n\n`;
    mensagem += `Qualquer dúvida manda mensagem. 💪\n`;
    mensagem += `_Bons treinos!_`;

    return mensagem;
  },

  // Gera o URL do WhatsApp com a mensagem
  enviarPlanoTreino: (phoneNumber, studentName, exercises, generalNotes, studentId) => {
    if (!phoneNumber) return null;

    let cleanNumber = phoneNumber.replace(/\D/g, '');

    if (!cleanNumber.startsWith('351') && cleanNumber.startsWith('9')) {
      cleanNumber = '351' + cleanNumber;
    }

    const texto = whatsappService.gerarTextoMensagem(studentName, exercises, generalNotes, studentId);
    const url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(texto)}`;

    return url;
  }
};

export default whatsappService;