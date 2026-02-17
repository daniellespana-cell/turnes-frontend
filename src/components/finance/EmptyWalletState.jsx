import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import EmptyState from '../common/EmptyState'; // Importamos la base

const EmptyWalletState = () => {
  const navigate = useNavigate();
  
  return (
    <EmptyState 
      icon={Wallet}
      title="Billetera lista"
      description="Recarga saldo para comenzar a publicar turnos y contratar personal para tu empresa."
      actionLabel="Realizar primera recarga"
      onAction={() => navigate('/dashboard/finanzas/recargar')}
    />
  );
};

export default EmptyWalletState;