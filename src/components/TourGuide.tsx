"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "@/app/styles/driver-theme.css";
import { useUser } from "@/contexts/useUser";
import { checkTourStatus, markTourComplete } from "@/utils/tour-status";

export default function TourGuide() {
  const { user, userData } = useUser();

  useEffect(() => {
    const initDriver = async () => {
      
      if (!userData?.nomeCompleto || !userData?.senioridade) return;

      const isCompleted = await checkTourStatus(user?.uid);
      
      if (isCompleted) return;

      const driverObj = driver({
        showProgress: true,
        animate: true,
        doneBtnText: "Entendi",
        nextBtnText: "Próximo",
        prevBtnText: "Voltar",
        steps: [
          { 
            element: '#nav-home', 
            popover: { 
              title: 'Início', 
              description: 'Bem vindo ao APP Oficial do Tech Start Summit!' 
            } 
          },
          { 
            element: '#nav-agenda', 
            popover: { 
              title: 'Programação', 
              description: 'Confira horários, palestras e favorite o que quer assistir.' 
            } 
          },
          { 
            element: '#nav-bingo', 
            popover: { 
              title: 'Bingo Gamificado', 
              description: 'Participe das atividades para completar a cartela e ganhar prêmios.' 
            } 
          },
          { 
            element: '#nav-profile', 
            popover: { 
              title: 'Seu Perfil', 
              description: 'Acesse suas informações, sua agenda outras funcionalidades aqui.' 
            } 
          }
        ],
        onDestroyStarted: () => {
          markTourComplete(user?.uid);
          driverObj.destroy();
        }
      });

      driverObj.drive();
    };

    const timer = setTimeout(() => {
      initDriver();
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, userData]);

  return null;
}