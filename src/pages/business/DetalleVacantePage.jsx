import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDetalleVacante } from '../../hooks/useDetalleVacante';
import { HeaderDetalle } from '../../components/detalleVacante/HeaderDetalle';
import { PostulanteCard } from '../../components/detalleVacante/PostulanteCard';
import { SidebarDetalle } from '../../components/detalleVacante/SidebarDetalle';

const DetalleVacantePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vacanteData, setVacanteData] = useState(null);

  const { hiredId, setHiredId, getFirstName } = useDetalleVacante();

  // 1. CARGA DE CONTRATO: Recuperamos la vacante real de la base de datos local
  useEffect(() => {
    const vacantes = JSON.parse(localStorage.getItem("turnes_vacantes") || "[]");
    const actual = vacantes.find(v => String(v.id) === String(id));
    if (actual) setVacanteData(actual);
  }, [id]);

  const [postulantes] = useState([
    {
      id: 101,
      name: "Carlos Alberto Ruiz Espitia",
      role: "Mesero de Protocolo / VIP",
      rating: 4.8,
      hitRate: "98%",
      trips: 45,
      status: "Activo",
      isVerified: true,
      distance: "1.2 KM",
      bio: "Especialista en eventos corporativos con 5 años de experiencia en servicio de alto nivel.",
      skills: ["Inglés", "Vinos", "Protocolo"],
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos"
    },
    {
      id: 102,
      name: "Ana Milena Suarez Vargas",
      role: "Bartender Profesional / Mixología",
      rating: 5.0,
      hitRate: "100%",
      trips: 12,
      status: "Offline",
      isVerified: false,
      distance: "3.8 KM",
      bio: "Mixóloga certificada con énfasis en coctelería de autor y gestión de inventarios.",
      skills: ["Coctelería", "Inventarios"],
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"
    }
  ]);

  const hiredPostulante = postulantes.find(p => p.id === hiredId);

  // RITUAL DE CONTRATACIÓN: Sincronizado con el sistema de exclusión
  const handleMatchAction = (cand) => {
    const firstName = getFirstName(cand.name);
    const iceBreaker = `Hola ${firstName}, soy el jefe en Turnes. He seleccionado tu perfil por tu reputación. ¿Hablamos?`;

    setHiredId(cand.id);

    // 2. TRANSMISIÓN INSTITUCIONAL COMPLETA
    // Incluimos fromVacanteId para que useChatLogic pueda mover la vacante a 'completed'
    setTimeout(() => {
      navigate(`/dashboard/chat/${cand.id}`, {
        state: {
          candidato: cand,
          fromVacante: id,
          metadata: {
            fromVacanteId: id, // Clave para el cierre exitoso
            type: vacanteData?.type || 'match',
            payment: vacanteData?.payment,
            billingConfig: vacanteData?.billingConfig,
            customMessage: iceBreaker
          }
        }
      });
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 pt-6 px-4 font-manrope min-h-screen text-zinc-300 antialiased">
      {/* Botón de retroceso unificado dentro del HeaderDetalle */}
      <HeaderDetalle id={id} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-4">
          {postulantes.map(cand => (
            <PostulanteCard
              key={cand.id}
              cand={cand}
              isSelected={hiredId === cand.id}
              isAnyHired={hiredId !== null}
              onContratar={() => handleMatchAction(cand)}
            />
          ))}
        </div>

        <aside className="lg:col-span-4 sticky top-6">
          <SidebarDetalle
            hiredFirstName={getFirstName(hiredPostulante?.name)}
          />
        </aside>
      </div>
    </div>
  );
};

export default DetalleVacantePage;