"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Trash2,
  Share2,
  Download,
  Ticket,
  Loader2,
  X,
  CalendarDays,
  MapPin
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "../../contexts/useUser";
import { db } from "../lib/firebase";
import { doc, updateDoc, arrayRemove, onSnapshot } from "firebase/firestore";

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
  date?: string;
}

const typeColors: Record<string, string> = {
  Abertura: "bg-blue-500",
  "Palestra Principal": "bg-[var(--primary)]",
  "Painel de Discussão": "bg-purple-500",
  "Workshop Prático": "bg-emerald-500",
  Pausa: "bg-gray-400",
};

const daySequenceLabels = ["PRIMEIRO DIA", "SEGUNDO DIA", "TERCEIRO DIA"];

export default function MyAgendaPage() {
  const { user, userData } = useUser();
  const router = useRouter();

  const [favorites, setFavorites] = useState<string[]>([]);
  const [selected, setSelected] = useState<AgendaItem | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setFavorites(snap.data().agenda_favorites || []);
      }
    });
  }, [user]);

  const { data: allItems = [], isLoading } = useQuery({
    queryKey: ["agenda"],
    queryFn: async () => {
      const res = await fetch("/api/agenda");
      if (!res.ok) throw new Error("Erro ao carregar agenda");
      return res.json() as Promise<AgendaItem[]>;
    },
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const myItems = allItems
    .filter((item) => favorites.includes(item.id))
    .sort((a, b) => {
      if (a.dayKey !== b.dayKey) return a.dayKey.localeCompare(b.dayKey);
      return a.time.localeCompare(b.time);
    });

  const groupedByDay: Record<string, AgendaItem[]> = {};
  myItems.forEach((item) => {
    groupedByDay[item.dayKey] = groupedByDay[item.dayKey] || [];
    groupedByDay[item.dayKey].push(item);
  });

  const orderedDays = Object.keys(groupedByDay).sort();

  const removeFromAgenda = async (
    e: React.MouseEvent | null,
    itemId: string
  ) => {
    if (e) e.stopPropagation();
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), {
      agenda_favorites: arrayRemove(itemId),
    });
    if (selected?.id === itemId) setSelected(null);
  };

  const downloadAgendaPDF = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const nomeFinal = userData?.apelido || user?.displayName || "Participante";
      const cargoFinal = userData?.senioridade || userData?.curso || "Inscrito";
      
      const res = await fetch("/api/agenda-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: myItems,
          userName: nomeFinal.toUpperCase(),
          userRole: cargoFinal.toUpperCase()
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Erro API PDF:", errText);
        throw new Error("Erro ao gerar PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `agenda-${nomeFinal.split(' ')[0].toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro no download:", error);
      alert("Não foi possível baixar o PDF agora. Verifique se o servidor backend está rodando.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-[var(--primary)]" />
        <h2 className="text-xl font-bold">Organizando sua jornada…</h2>
      </section>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Ticket size={48} className="mb-4 opacity-50" />
        <h2 className="text-xl font-bold mb-2">Sua credencial digital</h2>
        <p className="mb-6 opacity-70">
          Faça login para montar sua agenda personalizada.
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-[var(--primary)] px-6 py-2 rounded-xl font-bold text-white"
        >
          Acessar conta
        </button>
      </div>
    );
  }

  return (
    <section className="pb-32 pt-8 px-4 max-w-3xl mx-auto min-h-screen">
      <div className="flex justify-between items-end mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold">Minha Jornada</h1>
          <p className="text-sm opacity-70">
            {favorites.length} atividades selecionadas
          </p>
        </div>

        <div className="flex gap-2">
          <button className="hidden md:flex items-center gap-2 px-4 py-2 text-xs font-bold border rounded-lg hover:bg-gray-50 transition-colors">
            <Share2 size={14} /> Compartilhar
          </button>

          {favorites.length > 0 && (
            <button
              onClick={downloadAgendaPDF}
              disabled={isDownloading}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-lg transition-all ${
                isDownloading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-[var(--primary)] hover:opacity-90"
              }`}
            >
              {isDownloading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Gerando...
                </>
              ) : (
                <>
                  <Download size={14} /> Baixar PDF
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-3xl">
          <Calendar size={48} className="mx-auto mb-4 opacity-30" />
          <h3 className="text-xl font-bold mb-2">Nada por aqui ainda</h3>
          <p className="mb-6 opacity-70">
            Volte para a agenda completa e monte seu roteiro.
          </p>
          <button
            onClick={() => router.push("/agenda")}
            className="font-bold text-[var(--primary)] hover:underline"
          >
            Ver programação completa →
          </button>
        </div>
      ) : (
        <div className="space-y-12">
            {orderedDays.map((dayKey, index) => {
                const dayItems = groupedByDay[dayKey];
                const dayHeaderLabel = daySequenceLabels[index] || `${index + 1}º DIA`;
                
                return (
                    <div key={dayKey} className="relative">
                        <div className="sticky top-0 z-20 bg-[var(--background)]/95 backdrop-blur py-4 border-b border-[var(--border)] mb-6 flex items-center gap-4">
                             <div className="bg-[var(--secondary)] p-2.5 rounded-xl shadow-sm">
                                <CalendarDays className="text-[var(--primary)]" size={24} />
                             </div>
                             <div>
                                <span className="text-xs font-bold text-[var(--primary)] tracking-widest uppercase block mb-0.5">
                                    {dayHeaderLabel}
                                </span>
                                <h2 className="text-xl font-bold uppercase leading-none">
                                    {dayItems[0].dayLabel}
                                </h2>
                             </div>
                        </div>

                        <div className="space-y-4 pl-2 md:pl-4 border-l-2 border-[var(--border)] ml-5 md:ml-0">
                            {dayItems.map((item) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    key={item.id}
                                    onClick={() => setSelected(item)}
                                    className="relative bg-[var(--card)] rounded-xl border p-4 cursor-pointer hover:shadow-md transition-shadow group"
                                >
                                    <div
                                        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${typeColors[item.tipoConteudo]}`}
                                    />

                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex items-center gap-2 md:block min-w-[80px]">
                                            <span className="font-mono text-lg font-bold text-[var(--foreground)]">
                                                {item.time}
                                            </span>
                                            <span className="md:hidden text-xs text-[var(--muted-foreground)]">•</span>
                                            {item.track && (
                                                <div className="hidden md:flex items-center gap-1 text-[10px] text-[var(--muted-foreground)] mt-1">
                                                     <MapPin size={10} /> {item.track}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-[var(--primary)] transition-colors">
                                                    {item.nome}
                                                </h3>
                                                <button
                                                    onClick={(e) => removeFromAgenda(e, item.id)}
                                                    className="text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 p-2 rounded-full transition-all -mt-2 -mr-2"
                                                    title="Remover"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            
                                            <div className="text-sm opacity-70 mb-2">
                                                {item.speakerNames?.join(", ")}
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${typeColors[item.tipoConteudo] || 'border-gray-500'}`}>
                                                    {item.tipoConteudo}
                                                </span>
                                                {item.track && (
                                                    <span className="md:hidden text-[10px] flex items-center gap-1 bg-[var(--secondary)] px-2 py-0.5 rounded border border-[var(--border)]">
                                                        <MapPin size={10} /> {item.track}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[var(--card)] rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-[var(--border)]"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X />
              </button>

              <div className="pr-8">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border mb-3 inline-block ${typeColors[selected.tipoConteudo]}`}>
                        {selected.tipoConteudo}
                  </span>
                  <h3 className="text-2xl font-bold mb-2 leading-tight">{selected.nome}</h3>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto pr-2 my-4">
                  <p className="opacity-80 text-base leading-relaxed">
                    {selected.bigDescription || selected.description}
                  </p>
              </div>

              <button
                onClick={(e) => removeFromAgenda(e, selected.id)}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Trash2 size={20} />
                Remover da minha agenda
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}