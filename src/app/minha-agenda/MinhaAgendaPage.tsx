"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, CalendarDays, ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/useUser";
import { MOCK_NOTION_DATA, type AgendaItem } from "../agenda/data-mock"; // Reusando o mock

const typeColors: Record<string, string> = {
    "Abertura": "border-blue-500 text-blue-400 bg-blue-500/10",
    "Palestra Principal": "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/10",
    "Painel de Discussão": "border-purple-500 text-purple-400 bg-purple-500/10",
    "Workshop Prático": "border-emerald-500 text-emerald-400 bg-emerald-500/10",
    "Pausa": "border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--secondary)]",
};

export default function MinhaAgendaPage() {
    const { user, toggleAgendaItem } = useUser();
    const navigate = useNavigate();
    const [myTalks, setMyTalks] = useState<AgendaItem[]>([]);

    useEffect(() => {
        if (!user) {
            navigate("/");
            return;
        }

        // Filtra o Mock Data pegando só o que está no array do usuário
        const saved = MOCK_NOTION_DATA.filter(item => user.agenda?.includes(item.id));
        setMyTalks(saved);
    }, [user, navigate]);

    // Agrupa apenas as palestras salvas
    const grouped = myTalks.reduce((acc, item) => {
        if (!item.dayKey) return acc;
        if (!acc[item.dayKey]) acc[item.dayKey] = { label: item.dayLabel, items: [] };
        acc[item.dayKey].items.push(item);
        return acc;
    }, {} as Record<string, any>);

    // Ordena por horário dentro do dia
    Object.keys(grouped).forEach(day => {
        grouped[day].items.sort((a: AgendaItem, b: AgendaItem) => a.time.localeCompare(b.time));
    });

    const orderedDays = Object.keys(grouped).sort();

    return (
        <section className="pb-24 pt-6 px-4 md:px-8 max-w-3xl mx-auto min-h-screen">
            
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-[var(--card)] border border-[var(--border)]">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Minha Agenda</h1>
                    <p className="text-xs text-[var(--muted-foreground)]">Suas atividades selecionadas</p>
                </div>
            </div>

            {myTalks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                    <CalendarDays size={64} className="mb-4 text-[var(--primary)]" />
                    <h3 className="text-lg font-bold">Sua agenda está vazia</h3>
                    <p className="text-sm max-w-xs mt-2">Vá para a programação geral e clique em "Tenho Interesse" para montar seu cronograma.</p>
                    <button 
                        onClick={() => navigate("/agenda")}
                        className="mt-6 px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-bold text-sm"
                    >
                        Ver Programação
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {orderedDays.map(dayKey => (
                        <div key={dayKey} className="animate-fade-in-up">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--primary)] mb-4 border-b border-[var(--border)] pb-2">
                                {grouped[dayKey].label}
                            </h3>
                            
                            <div className="space-y-4">
                                {grouped[dayKey].items.map((item: AgendaItem) => (
                                    <div key={item.id} className="relative flex gap-4">
                                        {/* Coluna Horário */}
                                        <div className="flex flex-col items-center min-w-[3.5rem] pt-1">
                                            <span className="text-sm font-bold font-mono">{item.time}</span>
                                            <div className="h-full w-px bg-[var(--border)] mt-2 mb-2" />
                                        </div>

                                        {/* Card */}
                                        <div className="flex-1 bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 relative overflow-hidden group">
                                            {/* Faixa lateral colorida baseada no tipo */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${typeColors[item.tipoConteudo]?.split(' ')[0].replace('border-', 'bg-') || 'bg-gray-500'}`} />
                                            
                                            <div className="pl-2">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[10px] uppercase font-bold opacity-60">{item.tipoConteudo}</span>
                                                    <button 
                                                        onClick={() => toggleAgendaItem(item.id)}
                                                        className="text-[var(--destructive)] opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                
                                                <h4 className="font-bold text-lg leading-tight mb-2">{item.nome}</h4>
                                                
                                                <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                                                    {item.track && (
                                                        <span className="flex items-center gap-1 bg-[var(--secondary)] px-2 py-0.5 rounded">
                                                            <MapPin size={10} /> {item.track}
                                                        </span>
                                                    )}
                                                    {item.speakerNames.length > 0 && (
                                                        <span>{item.speakerNames[0]} {item.speakerNames.length > 1 && `+${item.speakerNames.length - 1}`}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}