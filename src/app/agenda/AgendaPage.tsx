"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Clock, X, MapPin, CalendarDays, Star } from "lucide-react"; // Importei Star para o botão de interesse
import { useNavigate } from "react-router-dom"; // Import necessário para redirecionamento
import { useUser } from "../../contexts/useUser";
import { MOCK_NOTION_DATA, type AgendaItem } from "./data-mock";

/* ---------------- CONFIG ---------------- */

const typeColors: Record<string, string> = {
    "Abertura": "border-blue-500 text-blue-400 bg-blue-500/10",
    "Palestra Principal": "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/10",
    "Painel de Discussão": "border-purple-500 text-purple-400 bg-purple-500/10",
    "Workshop Prático": "border-emerald-500 text-emerald-400 bg-emerald-500/10",
    "Pausa": "border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--secondary)]",
};

export default function AgendaPage() {
    const { user } = useUser();
    const navigate = useNavigate(); // Hook de navegação
    
    const [items, setItems] = useState<AgendaItem[]>([]);
    const [selected, setSelected] = useState<AgendaItem | null>(null);
    const [activeDay, setActiveDay] = useState<string | null>(null);

    useEffect(() => {
        setItems(MOCK_NOTION_DATA);
    }, []);

    // Função Lógica do Botão "Tenho Interesse"
    const handleTenhoInteresse = () => {
        if (!user) {
            // Se não estiver logado, redireciona para o login
            navigate("/"); 
            return;
        }
        
        // Aqui viria a lógica de salvar no banco de dados
        alert(`Interesse registrado em: ${selected?.nome}`);
        setSelected(null); // Fecha o modal (opcional)
    };

    // Agrupamento de dados (Mantido igual)
    const grouped = items.reduce((acc, item) => {
        if (!item.dayKey || !item.time) return acc;
        if (!acc[item.dayKey]) acc[item.dayKey] = { label: item.dayLabel, slots: {} };
        if (!acc[item.dayKey].slots[item.time]) acc[item.dayKey].slots[item.time] = [];
        acc[item.dayKey].slots[item.time].push(item);
        return acc;
    }, {} as Record<string, any>);

    const orderedDays = Object.keys(grouped).sort();

    useEffect(() => {
        if (orderedDays.length > 0 && !activeDay) {
            setActiveDay(orderedDays[0]);
        }
    }, [orderedDays, activeDay]);

    return (
        <section className="pb-24 pt-8 px-4 md:px-8 max-w-4xl mx-auto min-h-screen">
            
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Programação</h1>
                <p className="text-[var(--muted-foreground)]">
                    Confira as atividades do evento.
                </p>
            </div>

            {/* --- CORREÇÃO DO SCROLLBAR AQUI --- */}
            {/* Adicionei as classes [&::-webkit-scrollbar]:hidden etc... */}
            <div className="sticky top-0 z-30 bg-[var(--background)]/95 backdrop-blur pt-2 pb-4 border-b border-[var(--border)] mb-8">
                <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
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

            {/* LISTA DE CONTEÚDO (Mantida igual, só ocultei para brevidade mas você deve manter o código anterior aqui) */}
            <AnimatePresence mode="wait">
                {activeDay && grouped[activeDay] && (
                    <motion.div
                        key={activeDay}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {Object.entries(grouped[activeDay].slots).map(([time, events]: any) => (
                            <div key={time} className="mb-8 relative pl-6 border-l-2 border-[var(--border)] ml-3">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[var(--background)] border-2 border-[var(--primary)] z-10" />
                                <div className="flex items-center gap-3 mb-4 -mt-1.5">
                                    <span className="text-xl font-bold font-mono tracking-tight">{time}</span>
                                </div>
                                <div className="grid gap-4 md:grid-cols-1">
                                    {events.map((item: AgendaItem) => (
                                        <motion.div
                                            key={item.id}
                                            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelected(item)}
                                            className="p-5 bg-[var(--card)] rounded-xl border border-[var(--border)] cursor-pointer hover:border-[var(--primary)] transition-all shadow-sm group"
                                        >
                                            <div className="flex justify-between items-start gap-4 mb-3">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${typeColors[item.tipoConteudo] || 'border-gray-500 text-gray-500'}`}>
                                                    {item.tipoConteudo}
                                                </span>
                                                {item.track && (
                                                    <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 bg-[var(--secondary)] px-2 py-0.5 rounded-full">
                                                        <MapPin size={10} /> {item.track}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-lg font-bold leading-snug mb-2 group-hover:text-[var(--primary)] transition-colors">
                                                {item.nome}
                                            </h4>
                                            {item.speakerNames?.length > 0 && (
                                                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                                                    <User size={14} className="text-[var(--primary)]" />
                                                    <span>{item.speakerNames.join(", ")}</span>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
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

            {/* ================= MODAL ATUALIZADO ================= */}
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
                                {/* Informações do evento (mantido igual) */}
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
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">Sobre a atividade</h4>
                                    <p className="text-[var(--foreground)] leading-relaxed text-sm md:text-base">
                                        {selected.bigDescription || selected.description || "Sem descrição disponível."}
                                    </p>
                                </div>

                                {selected.speakerNames?.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Quem vai falar</h4>
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
                            </div>

                            {/* --- RODAPÉ COM BOTÃO DE INTERESSE --- */}
                            <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]/50">
                                <button 
                                    onClick={handleTenhoInteresse}
                                    className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold hover:opacity-90 transition shadow-lg shadow-[var(--primary)]/20 flex items-center justify-center gap-2"
                                >
                                    <Star size={18} fill="currentColor" className="text-white/20" />
                                    Tenho Interesse
                                </button>
                                {!user && (
                                    <p className="text-[10px] text-center mt-2 text-[var(--muted-foreground)]">
                                        Necessário fazer login para salvar na agenda.
                                    </p>
                                )}
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}