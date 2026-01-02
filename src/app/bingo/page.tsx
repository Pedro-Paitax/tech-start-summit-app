"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; 
import { useUser } from "../../contexts/useUser";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { generateBingoCard, BingoMission, BingoPreset } from "../../utils/bingoLogic";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

import { 
  Loader2, Trophy, Lock, CheckCircle2, X, 
  Camera, Linkedin, UserPlus, GlassWater, 
  MessageCircleQuestion, Instagram, Shirt, 
  Coffee, Handshake, Code2, Store, Gift, Mic2, Star, 
  LogIn, CalendarSearch 
} from "lucide-react";

const IconMap: Record<string, any> = {
  Camera, Linkedin, UserPlus, GlassWater, MessageCircleQuestion, 
  Instagram, Shirt, Coffee, Handshake, Code2, Store, Gift, Mic2, Lock, Star, Trophy
};

const DynamicIcon = ({ name, size = 24, className = "" }: { name: string, size?: number, className?: string }) => {
  const Icon = IconMap[name] || Star;
  return <Icon size={size} className={className} />;
};

export default function BingoPage() {
  const { user, userData } = useUser();
  const [missions, setMissions] = useState<BingoMission[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedMission, setSelectedMission] = useState<BingoMission | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: agendaItems = [] } = useQuery({
    queryKey: ["agenda"],
    queryFn: async () => (await fetch("/api/agenda")).json(),
    enabled: !!user && missions.length === 0,
    staleTime: 1000 * 60 * 60,
  });


  const { data: staticMissions = [] } = useQuery({
    queryKey: ["bingo_static_missions"],
    queryFn: async () => (await fetch("/api/bingo")).json(),
    enabled: !!user && missions.length === 0,
    staleTime: 1000 * 60 * 60,
  });

 
  useEffect(() => {
    async function loadBingo() {
      if (!user || !userData) return;

      const userRef = doc(db, "users", user.uid);
      
      try {
        const docSnap = await getDoc(userRef);
        const data = docSnap.data();

        if (data?.bingo_cards && data.bingo_cards.length > 0) {
          setMissions(data.bingo_cards);
          setCompletedIds(data.bingo_progress || []);
          setLoading(false);
        } 
        else if (agendaItems.length > 0 && staticMissions.length > 0) {
            
            if (!userData.agenda_favorites || userData.agenda_favorites.length === 0) {
                console.log("🚫 Usuário sem favoritos. Geração abortada.");
                setLoading(false);
                return;
            }

            console.log("🎲 Gerando nova cartela personalizada...");
            
            const newMissions = generateBingoCard(
                userData, 
                agendaItems, 
                staticMissions as BingoPreset[]
            );

            await updateDoc(userRef, {
                bingo_cards: newMissions,
                bingo_progress: []
            });

            setMissions(newMissions);
            setLoading(false);
        }
      } catch (error) {
        console.error("Erro ao carregar bingo:", error);
      }
    }

    loadBingo();
  }, [user, userData, agendaItems, staticMissions]);


  const handleCardClick = (mission: BingoMission) => {
    if (mission.isLocked) {
        const unlockedCount = completedIds.length;
        if (unlockedCount < 8) {
            alert(`Complete as outras missões primeiro! Faltam ${8 - unlockedCount}.`);
            return;
        }
    }
    if (completedIds.includes(mission.id)) return;

    setErrorMsg("");
    setInputCode("");
    setSelectedMission(mission);
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedMission || !user) return;

    let isValid = false;

    if (selectedMission.validationType === 'check') {
        isValid = true;
    } else if (selectedMission.validationType === 'code') {
        const correct = selectedMission.correctCode?.toUpperCase().trim();
        const input = inputCode.toUpperCase().trim();
        if (input === correct) isValid = true;
        else {
            setErrorMsg("Código incorreto. Tente novamente!");
            return;
        }
    }

    if (isValid) {
        const newCompleted = [...completedIds, selectedMission.id];
        setCompletedIds(newCompleted);
        setSelectedMission(null);
        confetti({ 
            particleCount: 100, spread: 70, origin: { y: 0.6 },
            colors: ['#22c55e', '#ffffff'] 
        });
        await updateDoc(doc(db, "users", user.uid), { bingo_progress: newCompleted });

    }
  };

  const isSecretUnlocked = completedIds.length >= 8;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-[var(--secondary)] rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Lock size={40} className="text-[var(--muted-foreground)]" />
        </div>
        
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
          Acesso <span className="text-[var(--primary)]">Restrito</span>
        </h2>
        
        <p className="text-sm text-[var(--muted-foreground)] max-w-xs mb-8 leading-relaxed">
          O Bingo é uma experiência personalizada. Faça login para gerar sua cartela exclusiva e concorrer a prêmios!
        </p>

        <Link 
          href="/" 
          className="w-full max-w-xs bg-[var(--primary)] hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-[var(--primary)]/20"
        >
          <LogIn size={20} />
          ENTRAR AGORA
        </Link>
      </div>
    );
  }


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-[var(--primary)]" size={40} />
        <p className="text-sm opacity-70">Sincronizando dados...</p>
      </div>
    );
  }


  if (missions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-in slide-in-from-bottom-4 duration-500">
          <div className="w-24 h-24 bg-gray-500/10 rounded-full flex items-center justify-center mb-6">
            <CalendarSearch size={40} className="text-[#be185d]" />
          </div>
          
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
            Quase <span className="text-[#be185d]">Lá!</span>
          </h2>
          
          <p className="text-sm text-[var(--muted-foreground)] max-w-xs mb-8 leading-relaxed">
            Para gerarmos uma cartela com a <strong>sua cara</strong>, precisamos saber o que você vai assistir.
            <br/><br/>
            Adicione palestras aos seus favoritos na Agenda e volte aqui!
          </p>
  
          <Link 
            href="/agenda" 
            className="w-full max-w-xs bg-[var(--foreground)] hover:bg-black/80 text-[var(--background)] font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl"
          >
            <CalendarSearch size={20} />
            IR PARA A AGENDA
          </Link>
        </div>
      );
  }


  return (
    <section className="pb-32 pt-6 px-4 max-w-lg mx-auto min-h-screen flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">
            TECH <span className="text-[var(--primary)]">QUEST</span>
        </h1>
        <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-3 w-40 bg-[var(--secondary)] rounded-full overflow-hidden">
                <div 
                    className="h-full bg-[var(--primary)] transition-all duration-500"
                    style={{ width: `${(completedIds.length / 9) * 100}%` }}
                />
            </div>
            <span className="text-sm font-bold text-[var(--muted-foreground)]">
                {completedIds.length}/9
            </span>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] px-4 leading-tight">
            Complete as missões laterais para desbloquear o prêmio final no centro!
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 aspect-square w-full">
        {missions.map((mission) => {
            const isCompleted = completedIds.includes(mission.id);
            const isCenter = mission.position === 4; 
            const isActuallyLocked = isCenter && !isSecretUnlocked && !isCompleted;

            return (
                <motion.button
                    key={mission.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCardClick(mission)}
                    disabled={isCompleted} 
                    className={`
                        relative flex flex-col items-center justify-center p-2 text-center rounded-2xl border-2 transition-all duration-300 overflow-hidden shadow-sm
                        ${isCompleted 
                            ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-md" 
                            : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]"
                        }
                        ${isActuallyLocked ? "bg-[var(--secondary)] opacity-90 cursor-not-allowed border-dashed" : ""}
                    `}
                >
                    {isCompleted && (
                        <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute top-1.5 right-1.5 bg-white text-[var(--primary)] rounded-full p-0.5 z-10"
                        >
                            <CheckCircle2 size={16} strokeWidth={4} />
                        </motion.div>
                    )}

                    <div className="flex flex-col items-center justify-center gap-2 z-0 px-0.5 w-full h-full">
                        {isActuallyLocked ? (
                            <>
                                <Lock size={32} className="text-[var(--muted-foreground)] opacity-50" />
                                <span className="text-[10px] uppercase font-extrabold text-[var(--muted-foreground)] tracking-widest">
                                    Bloqueado
                                </span>
                            </>
                        ) : (
                            <>
                                <DynamicIcon 
                                    name={mission.icon} 
                                    size={32} 
                                    className={`mb-1 transition-colors ${isCompleted ? "text-white" : "text-[var(--primary)]"}`} 
                                />
                                <p className={`text-[10px] sm:text-xs font-bold leading-3 line-clamp-3 w-full ${isCompleted ? "text-white" : "text-[var(--foreground)]"}`}>
                                    {mission.text}
                                </p>
                            </>
                        )}
                    </div>
                </motion.button>
            );
        })}
      </div>

      <AnimatePresence>
        {selectedMission && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setSelectedMission(null)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-[var(--card)] w-full max-w-sm p-6 rounded-3xl border border-[var(--border)] shadow-2xl flex flex-col items-center"
                >
                    <button 
                        onClick={() => setSelectedMission(null)} 
                        className="absolute top-4 right-4 p-2 bg-[var(--secondary)] rounded-full text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="w-20 h-20 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mb-5 text-[var(--primary)]">
                        <DynamicIcon name={selectedMission.icon} size={40} />
                    </div>

                    {selectedMission.relatedTalk && (
                        <div className="bg-[var(--secondary)]/50 p-3 rounded-xl mb-4 text-center w-full border border-[var(--border)]">
                            <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
                                Onde encontrar a resposta:
                            </p>
                            <p className="text-sm font-black text-[var(--primary)] leading-tight mb-0.5 line-clamp-2">
                                {selectedMission.relatedTalk}
                            </p>
                            <p className="text-xs font-medium text-[var(--foreground)]">
                                com {selectedMission.relatedSpeaker}
                            </p>
                        </div>
                    )}
                    
                    <h3 className="text-2xl font-black leading-tight mb-3 text-center text-[var(--foreground)] uppercase">
                        {selectedMission.text}
                    </h3>
                    
                    <p className="text-sm text-[var(--muted-foreground)] text-center mb-8 px-2">
                        {selectedMission.validationType === 'code' 
                            ? "Procure o código escondido no estande ou palestra e digite abaixo para validar." 
                            : "Ao marcar esta missão, você confirma honestamente que realizou a atividade."}
                    </p>

                    <form onSubmit={handleVerify} className="w-full space-y-4">
                        {selectedMission.validationType === 'code' && (
                            <div>
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="DIGITE O CÓDIGO"
                                    className="w-full text-center text-xl font-mono uppercase tracking-[0.2em] p-4 rounded-xl bg-[var(--secondary)] border-2 border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all placeholder:text-sm placeholder:tracking-normal placeholder:font-sans"
                                    value={inputCode}
                                    onChange={e => {
                                        setInputCode(e.target.value);
                                        setErrorMsg("");
                                    }}
                                />
                                {errorMsg && (
                                    <motion.p 
                                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                        className="text-sm text-red-500 font-bold mt-2 text-center flex items-center justify-center gap-1"
                                    >
                                        <X size={14} /> {errorMsg}
                                    </motion.p>
                                )}
                            </div>
                        )}

                        <button 
                            type="submit"
                            className="w-full bg-[var(--primary)] hover:opacity-90 text-white font-bold text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-[var(--primary)]/20 active:scale-95"
                        >
                            {selectedMission.validationType === 'code' ? 'VALIDAR CÓDIGO' : 'MARCAR FEITO'}
                        </button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </section>
  );
}