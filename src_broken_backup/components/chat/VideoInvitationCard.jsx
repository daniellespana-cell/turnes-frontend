// 2. PROTOCOLO DE VIDEO (Acción de Invitación)
  const invitarAVideo = () => {
    const invitationMsg = {
      id: `video-inv-${Date.now()}`,
      type: 'video_invitation', // Identificador clave para el renderizado en MessageList
      sender: 'me',
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    setMessages(prev => [...prev, invitationMsg]);
  };