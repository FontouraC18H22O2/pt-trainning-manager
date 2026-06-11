const whatsappService = {
  /**
   * 📝 Gera exatamente a string original da mensagem (para o Preview)
   */
  gerarTextoMensagem: (studentName, exercises, generalNotes) => {
    let mensagem = `*OLÁ, ${studentName.toUpperCase()}!* \n\n`;
    mensagem += `O teu *Plano de Treino* já está disponível! Aqui está a tua rotina de exercícios:\n\n`;

    if (generalNotes) {
      mensagem += ` *Nota:* _${generalNotes}_\n\n`;
    }

    mensagem += `*FICHA DE TREINO:*\n`;
    mensagem += `------------------------------------\n`;

    if (exercises && exercises.length > 0) {
      exercises.forEach((ex, idx) => {
        mensagem += `🔹 *${ex.exerciseName}*\n`; 
        mensagem += `   •  ${ex.sets} Séries x ${ex.reps} Reps\n`;
        mensagem += `   •  Descanso: ${ex.restTime}\n`;
        if (ex.notes) {
          mensagem += `   •  _Nota: ${ex.notes}_\n`;
        }
        mensagem += `\n`;
      });
    } else {
      mensagem += `Nenhum exercício registado de momento.\n\n`;
    }

    mensagem += `------------------------------------\n`;
    mensagem += ` Dá o teu máximo no próximo treino! Qualquer dúvida, avisa-me por aqui.\n`;
    mensagem += ` _Bons treinos!_`;

    return mensagem;
  },

  /**
   * 🚀 Limpa o número e junta o texto gerado para abrir a API do WhatsApp
   */
  enviarPlanoTreino: (phoneNumber, studentName, exercises, generalNotes) => {
    if (!phoneNumber) return null;

    let cleanNumber = phoneNumber.replace(/\D/g, '');
    
    if (!cleanNumber.startsWith('351') && cleanNumber.startsWith('9')) {
      cleanNumber = '351' + cleanNumber;
    }

    // Chama a função acima para apanhar a string original idêntica
    const textoFormatado = whatsappService.gerarTextoMensagem(studentName, exercises, generalNotes);

    return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(textoFormatado)}`;
  }
};

export default whatsappService;