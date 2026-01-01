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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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

export default function MyAgendaPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<string[]>([]);
  const [selected, setSelected] = useState<AgendaItem | null>(null);

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
      const res = await fetch("http://localhost:3333/agenda");
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
  const res = await fetch("http://localhost:3333/api/generate-agenda-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: myItems,
      userName: user?.displayName || "Participante",
    }),
  });

  if (!res.ok) {
    console.error("Erro ao gerar PDF");
    return;
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "minha-agenda-techsummit.pdf";
  a.click();

  window.URL.revokeObjectURL(url);
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
          onClick={() => navigate("/")}
          className="bg-[var(--primary)] px-6 py-2 rounded-xl font-bold text-white"
        >
          Acessar conta
        </button>
      </div>
    );
  }

  return (
    <section className="pb-24 pt-8 px-4 max-w-3xl mx-auto min-h-screen">
      <div className="flex justify-between items-end mb-10 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold">Minha Jornada</h1>
          <p className="text-sm opacity-70">
            {favorites.length} atividades selecionadas
          </p>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold border rounded-lg">
            <Share2 size={14} /> Compartilhar
          </button>

          {favorites.length > 0 && (
            <button
              onClick={downloadAgendaPDF}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[var(--primary)] text-white rounded-lg"
            >
              <Download size={14} />
              Baixar PDF
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
            onClick={() => navigate("/agenda")}
            className="font-bold text-[var(--primary)]"
          >
            Ver programação completa →
          </button>
        </div>
      ) : (
        Object.entries(groupedByDay).map(([dayKey, items]) => (
          <div key={dayKey} className="mb-10">
            <h2 className="text-lg font-bold mb-4">
              {items[0].dayLabel}
            </h2>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="relative bg-[var(--card)] rounded-xl border p-4 cursor-pointer"
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${typeColors[item.tipoConteudo]}`}
                  />

                  <div className="flex gap-4">
                    <div className="font-mono font-bold">{item.time}</div>
                    <div className="flex-1">
                      <h3 className="font-bold">{item.nome}</h3>
                      <div className="text-sm opacity-70">
                        {item.speakerNames?.[0]}
                      </div>
                    </div>

                    <button
                      onClick={(e) => removeFromAgenda(e, item.id)}
                      className="text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* MODAL */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-black/60"
            />

            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="relative bg-[var(--card)] rounded-2xl p-6 w-full max-w-lg"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4"
              >
                <X />
              </button>

              <h3 className="text-xl font-bold mb-2">{selected.nome}</h3>
              <p className="opacity-70 mb-4">
                {selected.bigDescription || selected.description}
              </p>

              <button
                onClick={(e) => removeFromAgenda(e, selected.id)}
                className="w-full bg-red-500 text-white py-3 rounded-xl font-bold"
              >
                Remover da minha agenda
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
