const whatsappService = {
  gerarTextoMensagem: (studentName, exercises, generalNotes, planId) => {
    let mensagem = `*OLÁ, ${studentName.toUpperCase()}!* \n\n`;
    mensagem += `O teu *Plano de Treino* já está disponível! Aqui está a tua rotina de exercícios:\n\n`;

    if (generalNotes) {
      mensagem += ` *Nota:* _${generalNotes}_\n\n`;
    }

    mensagem += `*FICHA DE TREINO:*\n`;
    mensagem += `------------------------------------\n`;

    if (exercises && exercises.length > 0) {
      exercises.forEach((ex) => {
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
    
    if (planId) {
      mensagem += `🔗 *Clica no link para veres os GIFs animados do teu treino:*\n`;
      mensagem += `http://localhost:5173/meutreino/${planId}\n\n`;
      mensagem += `------------------------------------\n`;
    }

    mensagem += ` Dá o teu máximo no próximo treino! Qualquer dúvida, avisa-me por aqui.\n`;
    mensagem += ` _Bons treinos!_`;

    return mensagem;
  },

  enviarPlanoTreino: (phoneNumber, studentName, exercises, generalNotes, planId) => {
    if (!phoneNumber) return null;

    let cleanNumber = phoneNumber.replace(/\D/g, '');
    
    if (!cleanNumber.startsWith('351') && cleanNumber.startsWith('9')) {
      cleanNumber = '351' + cleanNumber;
    }

    const texto = whatsappService.gerarTextoMensagem(studentName, exercises, generalNotes, planId);
    const url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(texto)}`;
    
    return url;
  }
};

export default whatsappService;