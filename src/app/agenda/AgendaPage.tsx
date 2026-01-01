"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Clock, X, MapPin, CalendarDays, Star, Layers, Target, Hash, CheckCircle2, Trash2, Loader2, MousePointerClick, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/useUser";
import { db } from "../lib/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, setDoc } from "firebase/firestore";

interface AgendaItem {
  id: string;
  nome: string;
  tipoConteudo: string;
  dayKey: string;
  dayLabel: string;
  time: string;
  track?: string;
  description?: string;
  bigDescription?: string;
  speakerNames?: string[];
  publico?: string;
  area?: string[];
  topics?: string;
  tags?: string[];
}

const typeColors: Record<string, string> = {
  "Abertura": "border-blue-500 text-blue-400 bg-blue-500/10",
  "Palestra Principal": "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/10",
  "Painel de Discussão": "border-purple-500 text-purple-400 bg-purple-500/10",
  "Workshop Prático": "border-emerald-500 text-emerald-400 bg-emerald-500/10",
  "Pausa": "border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--secondary)]",
};

const getAreaColor = (area: string) => {
  const map: Record<string, string> = {
    'Soft Skills': 'bg-pink-500/10 text-pink-600 border-pink-200',
    'Desenvolvimento': 'bg-blue-500/10 text-blue-600 border-blue-200',
    'Dados': 'bg-green-500/10 text-green-600 border-green-200',
    'Empreendedorismo': 'bg-orange-500/10 text-orange-600 border-orange-200',
  };
  return map[area] || 'bg-gray-100 text-gray-600 border-gray-200';
};

export default function AgendaPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [selected, setSelected] = useState<AgendaItem | null>(null);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [showInterestModal, setShowInterestModal] = useState(false);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setFavorites([]);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFavorites(data.agenda_favorites || []);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["agenda"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3333/agenda");
      if (!res.ok) throw new Error("Erro ao carregar agenda");
      return res.json() as Promise<AgendaItem[]>;
    },
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const toggleInterest = async (itemId: string) => {
    if (!user?.uid) {
      navigate("/");
      return;
    }

    setIsSaving(true);
    const userDocRef = doc(db, "users", user.uid);
    const isAlreadyFavorite = favorites.includes(itemId);

    try {
      if (isAlreadyFavorite) {
        await updateDoc(userDocRef, {
          agenda_favorites: arrayRemove(itemId)
        });
      } else {
        await setDoc(userDocRef, {
          agenda_favorites: arrayUnion(itemId)
        }, { merge: true });

        setShowInterestModal(true);
      }
    } catch (error) {
      console.error("Erro ao salvar favorito:", error);
      alert("Erro ao salvar. Verifique sua conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  type GroupedSlots = {
    label: string;
    slots: Record<string, AgendaItem[]>;
  };
  const grouped = (items || []).reduce<Record<string, GroupedSlots>>((acc, item) => {
    if (!item.dayKey || !item.time) return acc;
    if (!acc[item.dayKey]) acc[item.dayKey] = { label: item.dayLabel, slots: {} };
    if (!acc[item.dayKey].slots[item.time]) acc[item.dayKey].slots[item.time] = [];
    acc[item.dayKey].slots[item.time].push(item);
    return acc;
  }, {});

  const orderedDays = Object.keys(grouped).sort();

  useEffect(() => {
    if (orderedDays.length > 0 && !activeDay) {
      setActiveDay(orderedDays[0]);
    }
  }, [orderedDays, activeDay]);

  const getTopicsList = (topicsString?: string) => {
    if (!topicsString) return [];
    return topicsString.split(';').map(t => t.trim()).filter(Boolean);
  };

  if (isLoading) {
    return (
      <section className="flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full mb-6"
        />
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Carregando agenda...</h2>
        <p> Estamos buscando todas as atividades para você </p>
      </section>
    );
  }

  return (
    <section className="pb-24 pt-8 px-4 md:px-8 max-w-4xl mx-auto min-h-screen">

      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Programação</h1>
          <p className="text-[var(--muted-foreground)] flex items-center gap-2">
            <MousePointerClick size={16} />
            Clique nos cards para ver detalhes e salvar.
          </p>
        </div>
        {favorites.length > 0 && (
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 rounded-full">
            <Star size={12} fill="currentColor" />
            {favorites.length} salvos
          </div>
        )}
      </div>

      <div className="sticky top-0 z-30 bg-[var(--background)]/95 backdrop-blur pt-2 pb-4 border-b border-[var(--border)] mb-8">
        <div className="flex gap-3 pb-2">
          {orderedDays.map((dayKey) => {
            const isActive = activeDay === dayKey;
            const dateObj = new Date(dayKey + "T00:00:00");
            const dayNumber = dateObj.getDate();
            const monthName = dateObj.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');

            return (
              <button
                key={dayKey}
                onClick={() => setActiveDay(dayKey)}
                className={`
                  relative flex-shrink-0 flex flex-col items-center justify-center 
                  min-w-[4.5rem] py-2 px-4 rounded-xl border transition-all duration-300
                  ${isActive
                    ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20 scale-105"
                    : "bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--muted-foreground)]"
                  }
                `}
              >
                <span className="text-xs font-medium opacity-80">{monthName}</span>
                <span className="text-xl font-bold leading-none">{dayNumber}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 w-1 h-1 rounded-full bg-[var(--primary)]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {activeDay && grouped[activeDay] && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={activeDay}
            className="text-xs text-[var(--primary)] font-bold uppercase tracking-widest mt-2"
          >
            {grouped[activeDay].label}
          </motion.p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeDay && grouped[activeDay] && (
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {Object.entries(grouped[activeDay].slots).map(([time, events]: [string, AgendaItem[]]) => (<div key={time} className="mb-8 relative pl-6 border-l-2 border-[var(--border)] ml-3">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[var(--background)] border-2 border-[var(--primary)] z-10" />

              <div className="flex items-center gap-3 mb-4 -mt-1.5">
                <div className="flex items-center gap-2 text-[var(--primary)]">
                  <Clock size={18} strokeWidth={2.5} />
                  <span className="text-xl font-bold font-mono tracking-tight text-[var(--foreground)]">
                    {time}
                  </span>
                </div>

                {events.length > 1 && (
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--muted-foreground)] bg-[var(--secondary)] px-2.5 py-1 rounded-full border border-[var(--border)]">
                    <Layers size={12} />
                    {events.length} simultâneas
                  </span>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-1">
                {events.map((item: AgendaItem) => {
                  const isFavorite = favorites.includes(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setSelected(item)}
                      className={`
                          p-5 rounded-xl border cursor-pointer transition-all shadow-sm group flex flex-col h-full relative overflow-hidden
                          ${isFavorite
                          ? "bg-[var(--primary)]/5 border-[var(--primary)]/30"
                          : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]"
                        }
                        `}
                    >
                      {isFavorite && (
                        <div className="absolute top-0 right-0 p-2">
                          <Star size={16} className="text-[var(--primary)] fill-[var(--primary)]" />
                        </div>
                      )}

                      <div className="flex justify-between items-start gap-4 mb-3 pr-6">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${typeColors[item.tipoConteudo] || 'border-gray-500 text-gray-500'}`}>
                          {item.tipoConteudo}
                        </span>
                        {item.track && (
                          <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 bg-[var(--secondary)] px-2 py-0.5 rounded-full whitespace-nowrap">
                            <MapPin size={10} /> {item.track}
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-bold leading-snug mb-2 group-hover:text-[var(--primary)] transition-colors">
                        {item.nome}
                      </h4>

                      {item.speakerNames && item.speakerNames.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-4">
                          <User size={14} className="text-[var(--primary)]" />
                          <span>{item.speakerNames.join(", ")}</span>
                        </div>
                      )}

                      <div className="mt-auto pt-3 border-t border-[var(--border)] flex flex-wrap gap-2 items-center justify-between">
                         <div className="flex flex-wrap gap-2">
                            {item.publico && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-slate-800 text-white">
                                <Target size={10} />
                                {item.publico}
                            </span>
                            )}
                            {item.area?.map((areaName, idx) => (
                            <span key={idx} className={`px-2 py-1 rounded-md text-[10px] font-medium border ${getAreaColor(areaName)}`}>
                                {areaName}
                            </span>
                            ))}
                         </div>
                         
                         <span className="text-xs text-[var(--primary)] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                           Ver detalhes <ChevronRight size={12} />
                         </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            ))}
            {Object.keys(grouped[activeDay].slots).length === 0 && (
              <div className="text-center py-20 text-[var(--muted-foreground)]">
                <CalendarDays size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nenhuma atividade programada para este dia.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="p-6 border-b border-[var(--border)] bg-[var(--background)]/50 relative">
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--secondary)] transition z-20">
                  <X size={20} />
                </button>
                <div className="pr-6">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border mb-3 inline-block ${typeColors[selected.tipoConteudo]}`}>
                    {selected.tipoConteudo}
                  </span>
                  <h3 className="text-xl font-bold leading-tight">{selected.nome}</h3>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-[var(--foreground)] bg-[var(--secondary)]/50 px-3 py-2 rounded-lg border border-[var(--border)]">
                    <Clock size={16} className="text-[var(--primary)]" />
                    <span className="font-mono font-bold">{selected.time}</span>
                  </div>
                  {selected.track && (
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)] px-2 py-2">
                      <MapPin size={16} />
                      <span>{selected.track}</span>
                    </div>
                  )}
                  {selected.publico && (
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)] px-2 py-2">
                      <Target size={16} />
                      <span>Público: {selected.publico}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Sobre a atividade</h4>
                  <p className="text-[var(--foreground)] leading-relaxed text-sm md:text-base">
                    {selected.bigDescription || selected.description || "Sem descrição disponível."}
                  </p>
                </div>

                {getTopicsList(selected.topics).length > 0 && (
                  <div className="bg-[var(--secondary)]/30 rounded-xl p-4 border border-[var(--border)]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-3 flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-[var(--primary)]" />
                      O que você vai ver
                    </h4>
                    <ul className="space-y-2">
                      {getTopicsList(selected.topics).map((topic, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-[var(--primary)] flex-shrink-0" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.speakerNames && selected.speakerNames.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
                      Quem vai falar
                    </h4>
                    <div className="grid gap-3">
                      {selected.speakerNames.map(name => (
                        <div key={name} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--input)]/10 hover:bg-[var(--input)]/30 transition">
                          <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
                            <User size={16} />
                          </div>
                          <span className="font-medium">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selected.tags && selected.tags.length > 0 && (
                  <div className="pt-4 border-t border-[var(--border)]">
                    <div className="flex flex-wrap gap-2">
                      {selected.tags.map((tag, i) => (
                        <span key={i} className="flex items-center text-xs text-[var(--muted-foreground)] bg-[var(--secondary)] px-2 py-1 rounded-full">
                          <Hash size={10} className="mr-1 opacity-50" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]/50">
                  <button
                    onClick={() => toggleInterest(selected.id)}
                    disabled={isSaving}
                    className={`
                    w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg
                    ${favorites.includes(selected.id)
                        ? "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--destructive)] hover:text-white"
                        : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 shadow-[var(--primary)]/20"
                      }
                    ${isSaving ? "opacity-70 cursor-wait" : ""}
                  `}
                  >
                    {isSaving ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : favorites.includes(selected.id) ? (
                      <>
                        <Trash2 size={18} />
                        Remover da minha agenda
                      </>
                    ) : (
                      <>
                        <Star size={18} fill="currentColor" className="text-white/20" />
                        Tenho Interesse
                      </>
                    )}
                  </button>
                  {!user && (
                    <p className="text-[10px] text-center mt-2 text-[var(--muted-foreground)]">
                      Necessário fazer login para salvar na agenda.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInterestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowInterestModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                  <Star size={24} fill="currentColor" />
                </div>
                <h3 className="text-lg font-bold mb-2">Salvo na nuvem!</h3>
                <p className="text-[var(--muted-foreground)] mb-4">
                  Essa atividade foi salva na sua conta e estará disponível em todos os seus dispositivos.
                </p>
                <button
                  onClick={() => setShowInterestModal(false)}
                  className="py-2 px-6 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold hover:opacity-90 transition"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}