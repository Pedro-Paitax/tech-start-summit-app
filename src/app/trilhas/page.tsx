"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";


function TrackCard({
  title,
  audience,
  promise,
  color,
  onClick
}: {
  title: string;
  audience: string;
  promise: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
      rounded-2xl border border-white/10
      bg-[#141414]
      p-6 text-left
      transition-all
      hover:bg-[#1b1b1b]
      hover:border-white/20
      hover:-translate-y-1
      shadow-md
      w-full
      "
    >
      <div className="space-y-4">
        <div className="w-4 h-4 rounded-full" style={{ background: color }} />

        <h2 className="text-xl font-semibold text-white">{title}</h2>

        <p className="text-sm text-white/60">👥 {audience}</p>

        <p className="text-sm text-white/80">{promise}</p>

        <p className="text-xs font-medium mt-3" style={{ color }}>
          Para ver mais conteúdo dessa trilha, procure por essa cor
        </p>
      </div>
    </button>
  );
}

function TrackModal({
  track,
  onClose
}: {
  track: any;
  onClose: () => void;
}) {
  const router = useRouter();

  const handleSelectTrack = async () => {
    const user = auth.currentUser;

    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);

        await updateDoc(userRef, {
          trilhaSelecionada: track.id,
          trilhaCor: track.color,
          trilhaTitulo: track.title,
          trilhaUpdatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Erro ao salvar trilha:", err);
      }
    }

    onClose();
    router.replace("/agenda");
  };

  return (
    <AnimatePresence>
      {track && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-8 text-white relative"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.18 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 opacity-60 hover:opacity-100"
            >
              <X size={20} />
            </button>

            <div className="space-y-6">
              <div className="space-y-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ background: track.color }}
                />
                <h2 className="text-2xl font-bold">{track.title}</h2>
                <p className="text-sm text-white/70">{track.description}</p>
              </div>

              <div>
                <p className="font-semibold mb-2">🎤 Palestras exemplo</p>
                <ul className="text-sm text-white/80 list-disc ml-5 space-y-1">
                  {track.talks.map((t: string) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-semibold mb-2">⚡ Ativações</p>
                <ul className="text-sm text-white/80 list-disc ml-5 space-y-1">
                  {track.activities.map((a: string) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleSelectTrack}
                className="w-full py-3 rounded-xl font-semibold text-black"
                style={{ background: track.color }}
              >
                Quero essa trilha!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


function IntroModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-xl p-8 text-white relative"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.18 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 opacity-60 hover:opacity-100"
          >
            <X size={20} />
          </button>

          <div className="space-y-5">
            <h2 className="text-2xl font-bold">Como funcionam as trilhas?</h2>

            <p className="text-white/70 text-sm leading-relaxed">
              O Tech Start Summit é dividido em 5 trilhas temáticas. Cada uma
              reúne palestras, workshops e ativações focadas em objetivos
              diferentes.
            </p>

            <p className="text-white/70 text-sm leading-relaxed">
              Escolha a que mais combina com você e siga a cor dela na agenda
              para encontrar os conteúdos recomendados.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold bg-white text-black mt-4"
            >
              Entendi, escolher trilha
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function TrilhasPage() {
  const [selected, setSelected] = useState<any>(null);
  const [introOpen, setIntroOpen] = useState(true);

const router = useRouter();


  const tracks = [
    {
      id: "dev",
      title: "Dev",
      color: "#00E5FF",
      audience: "Quem quer criar sites, apps e sistemas",
      promise: "Mão na massa com código de verdade",
      description:
        "Construa projetos reais, pratique lógica e aprenda as tecnologias mais usadas pelo mercado.",
      talks: ["React vs Angular", "Deploy na prática", "Primeiro estágio Dev"],
      activities: ["Mini hackathon", "Coding challenge", "Live coding"]
    },
    {
      id: "infra",
      title: "Infra & Cloud",
      color: "#A855F7",
      audience: "Servidores, redes e segurança",
      promise: "Descubra como a internet funciona fisicamente",
      description:
        "Aprenda o que acontece por trás dos sistemas: nuvem, deploy, servidores e segurança.",
      talks: ["A nuvem é mentira", "Como funciona um deploy", "DevOps 101"],
      activities: ["Simulação de deploy", "Labs de Docker", "CTF básico"]
    },
    {
      id: "dados",
      title: "Dados & IA",
      color: "#22C55E",
      audience: "Lógica, análise e inteligência artificial",
      promise: "Entenda como as máquinas aprendem",
      description:
        "Do Excel ao Python: análise de dados, dashboards e primeiros modelos de IA.",
      talks: ["Excel ao Python", "Primeiro modelo ML", "Carreira em Data"],
      activities: ["Análise de dataset real", "Desafio SQL", "Mini IA"]
    },
    {
      id: "discovery",
      title: "Discovery",
      color: "#F97316",
      audience: "Calouros e transição de carreira",
      promise: "Descubra qual área combina com você",
      description:
        "Explore todas as áreas da tecnologia antes de decidir seu caminho.",
      talks: ["Front vs Back vs Dados", "Mapa das áreas tech"],
      activities: ["Tour de estandes", "Talks rápidas", "Quiz vocacional"]
    },
    {
      id: "carreira",
      title: "Carreira",
      color: "#FACC15",
      audience: "Quem busca estágio ou primeiro emprego",
      promise: "O passo a passo para ser contratado",
      description:
        "Currículo, LinkedIn, entrevistas e estratégias reais para entrar no mercado.",
      talks: ["O que as empresas querem", "LinkedIn forte", "Entrevista técnica"],
      activities: ["Review de currículo", "Mock interview", "Mentorias"]
    }
  ];

  return (
    <main className="h-full text-white px-10 py-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="text-center space-y-3">
          <h1 className="text-4xl font-bold">Escolha sua trilha</h1>
          <p className="text-white/60">
            Cada cor representa uma jornada diferente dentro do evento
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {tracks.slice(0, 3).map((track) => (
            <TrackCard
              key={track.id}
              {...track}
              onClick={() => setSelected(track)}
            />
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {tracks.slice(3).map((track) => (
            <TrackCard
              key={track.id}
              {...track}
              onClick={() => setSelected(track)}
            />
          ))}
        </div>
      </div>

      {introOpen && <IntroModal onClose={() => setIntroOpen(false)} />}
      <TrackModal track={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
