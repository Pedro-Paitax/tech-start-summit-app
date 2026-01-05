"use client";

import * as React from "react";
import { MapPin, Mic, Download } from "lucide-react";
import * as htmlToImage from "html-to-image";

interface AgendaItem {
  id: string;
  nome: string;
  time: string;
  track?: string;
  tipoConteudo: string;
  speakerNames?: string[];
  dayKey: string; 
}

interface PdfPayload {
  items: AgendaItem[];
  userName: string;
  userRole: string;
}

export default function AgendaSummit() {
  const [data, setData] = React.useState<PdfPayload | null>(null);
  const agendaRef = React.useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [selectedDay, setSelectedDay] = React.useState<1 | 2>(1);

  React.useEffect(() => {
    const raw = sessionStorage.getItem("agenda-pdf-data") || localStorage.getItem("agenda-pdf-data");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setData(parsed);
      } catch (err) {
        console.error("Erro ao ler dados", err);
      }
    }
  }, []);

  async function handleGeneratePng() {
    if (!agendaRef.current) return;
    try {
      setIsGenerating(true);
      const filename = selectedDay === 1 
        ? "agenda-tech-start-dia-30.png" 
        : "agenda-tech-start-dia-31.png";
      const dataUrl = await htmlToImage.toPng(agendaRef.current, {
        backgroundColor: "#1a1a1a",
        pixelRatio: 3,
        width: 1080,
        cacheBust: true,
        style: { fontFamily: 'Inter, sans-serif' },
      });
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Erro ao gerar PNG", err);
    } finally {
      setIsGenerating(false);
    }
  }

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white bg-zinc-900">
        Carregando agenda...
      </main>
    );
  }

  const itemsByDay = {
    1: data.items.filter(i => i.dayKey.includes("2026-05-30") || i.dayKey.includes("2025-05-30")),
    2: data.items.filter(i => i.dayKey.includes("2026-05-31") || i.dayKey.includes("2025-05-31")),
  };

  const currentItems = itemsByDay[selectedDay];

  return (
    <main className="min-h-screen bg-zinc-900 text-white p-4 md:p-8 flex justify-center overflow-x-hidden">
      <div className="flex flex-col items-center w-full">
        <div className="w-full max-w-[1080px] flex flex-col md:flex-row justify-between items-center md:items-end mb-6 gap-4">
          <div className="flex space-x-2 w-full md:w-auto justify-center md:justify-start">
            <button
              onClick={() => setSelectedDay(1)}
              className={`flex-1 md:flex-none px-4 md:px-6 py-3 font-bold uppercase tracking-wider text-xs md:text-sm transition-all transform skew-x-[-10deg] ${
                selectedDay === 1 
                  ? "bg-pink-600 text-white shadow-lg shadow-pink-900/50" 
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              <span className="block transform skew-x-[10deg]">Dia 30/05</span>
            </button>
            <button
              onClick={() => setSelectedDay(2)}
              className={`flex-1 md:flex-none px-4 md:px-6 py-3 font-bold uppercase tracking-wider text-xs md:text-sm transition-all transform skew-x-[-10deg] ${
                selectedDay === 2 
                  ? "bg-pink-600 text-white shadow-lg shadow-pink-900/50" 
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              <span className="block transform skew-x-[10deg]">Dia 31/05</span>
            </button>
          </div>
          <button
            onClick={handleGeneratePng}
            disabled={isGenerating}
            className="w-full md:w-auto bg-white text-black hover:bg-zinc-200 disabled:opacity-50 px-8 py-3 font-black uppercase text-sm tracking-widest transition-colors flex items-center justify-center gap-2 rounded md:rounded-none"
          >
            {isGenerating ? (
              "Gerando..." 
            ) : (
              <>
                <Download size={18} />
                <span>Baixar Agenda Dia {selectedDay === 1 ? '30' : '31'}</span>
              </>
            )}
          </button>
        </div>
        <div className="w-full max-w-full overflow-x-auto pb-8">
          <div
            ref={agendaRef}
            className="w-[1080px] bg-[#1a1a1a] text-white p-12 space-y-12 relative overflow-hidden flex flex-col min-h-[1920px] mx-auto" 
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
            <header className="relative z-10">
              <div className="flex justify-between items-center mb-12">
                <div className="flex flex-col flex-shrink-0">
                  <h1 className="text-6xl font-black text-white italic tracking-tighter">SUA</h1>
                  <h1 className="text-7xl font-black text-pink-600 italic tracking-tighter leading-none">AGENDA</h1>
                </div>
                <div className="flex-1 flex justify-center px-8">
                  <img
                    src="/images/TechStartSummitLogo.svg"
                    alt="Tech Start Summit Logo"
                    className="h-52 w-auto object-contain drop-shadow-2xl"
                  />
                </div>
                <div className="text-right space-y-4 flex-shrink-0">
                  <div className="bg-white text-black px-4 py-1 font-black text-xl tracking-tighter inline-block transform skew-x-[-10deg]">
                    <span className="block transform skew-x-[10deg]">TECH <span className="text-pink-600">START</span> SUMMIT</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-4xl font-bold uppercase text-white">{data.userName}</p>
                    <p className="text-xl text-pink-500 uppercase font-medium tracking-widest mt-1">{data.userRole}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between gap-6 mb-8">
                <div className="bg-white text-black px-6 py-3 flex-1 transform -skew-x-6 border-l-8 border-pink-600">
                  <div className="transform skew-x-6 flex flex-col justify-center h-full text-center">
                    <span className="font-black text-lg leading-tight block">{selectedDay === 1 ? "30 DE MAIO" : "31 DE MAIO"}</span>
                    <span className="text-sm font-bold block">09:00 - 21:30</span>
                  </div>
                </div>
                <div className="bg-white text-black px-6 py-3 flex-1 transform -skew-x-6">
                  <div className="transform skew-x-6 flex flex-col justify-center h-full text-center">
                    <span className="font-black text-lg leading-tight block">EXPO FIEP</span>
                    <span className="text-sm font-bold block">CURITIBA - PR</span>
                  </div>
                </div>
                <div className="bg-white text-black px-6 py-3 flex-1 transform -skew-x-6">
                  <div className="transform skew-x-6 flex flex-col justify-center h-full text-center">
                    <span className="font-black text-lg leading-tight block">{currentItems.length} ATIVIDADES</span>
                    <span className="text-sm font-bold block">NESTE DIA</span>
                  </div>
                </div>
              </div>
            </header>
            <div className="flex-1 relative z-10">
              {currentItems.length === 0 ? (
                <div className="text-center py-20 text-zinc-500 text-xl font-bold uppercase tracking-widest border-2 border-dashed border-zinc-800 rounded-lg">
                  Nenhuma atividade salva para este dia.
                </div>
              ) : (
                <section>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-1.5 h-10 bg-pink-600 self-end mb-1"></div>
                    <div className="flex items-baseline gap-3">
                      <h2 className="text-5xl font-black italic text-white tracking-tighter leading-none">{selectedDay === 1 ? "PRIMEIRO DIA" : "SEGUNDO DIA"}</h2>
                      <span className="text-2xl font-bold text-zinc-600">// {selectedDay === 1 ? "30/05" : "31/05"}</span>
                    </div>
                    <div className="h-px bg-zinc-800 flex-1 mt-4"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-12 pb-12">
                    {currentItems.map((item) => (
                      <div key={item.id} className="relative group">
                        <div className="absolute -top-4 -left-2 z-20 bg-black text-white px-4 py-1 transform -rotate-2 shadow-xl border-l-2 border-pink-600">
                          <span className="text-xl font-black tracking-tight">{item.time}</span>
                        </div>
                        <article className="bg-zinc-100 h-[210px] p-6 flex flex-col relative text-black shadow-[8px_8px_0px_#000]">
                          <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            <span>{item.track || "PALCO PRINCIPAL"}</span>
                            <MapPin size={12} />
                          </div>
                          <div className="mt-6 mb-auto">
                            <h3 className="text-xl font-black leading-tight text-zinc-900 line-clamp-3">{item.nome}</h3>
                          </div>
                          <div className="flex flex-col gap-3 mt-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 uppercase">
                              {item.speakerNames && item.speakerNames.length > 0 ? (
                                <>
                                  <Mic size={14} className="text-pink-600" />
                                  <span>{item.speakerNames[0]}</span>
                                </>
                              ) : <span className="h-4 block" />}
                            </div>
                            <div>
                              <span className="bg-black text-white text-[10px] font-bold uppercase px-3 py-1.5 tracking-wider inline-block">{item.tipoConteudo}</span>
                            </div>
                          </div>
                        </article>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
            <footer className="mt-auto pt-6 border-t border-zinc-800 flex justify-between text-zinc-500 text-sm font-medium uppercase tracking-widest">
              <span>Tech Start Summit 2025</span>
              <span>Curitiba - Paraná</span>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
