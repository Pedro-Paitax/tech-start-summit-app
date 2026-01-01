import React from 'react';

interface AgendaItem {
  id: string;
  nome: string;
  time: string | null;
  speakerNames?: string[];
  presenters?: { name: string; type: 'person' | 'company' }[];
  track?: string;
  tipoConteudo?: string;
  dayKey: string | null;
}

interface AgendaTemplateProps {
  items: AgendaItem[];
  user: {
    name: string;
    role: string;
  };
  logoBase64: string;
}

const daySequenceLabels = ["PRIMEIRO DIA", "SEGUNDO DIA", "TERCEIRO DIA"];

export const AgendaTemplate: React.FC<AgendaTemplateProps> = ({ items, user, logoBase64 }) => {
  const groupedItems = items.reduce((acc, item) => {
    if (!item.dayKey) return acc;
    if (!acc[item.dayKey]) acc[item.dayKey] = [];
    acc[item.dayKey].push(item);
    return acc;
  }, {} as Record<string, AgendaItem[]>);

  const sortedDays = Object.keys(groupedItems).sort();

  return (
    // Padding grande (p-12) para compensar a margem 0 do PDF
    <div className="w-full min-h-screen bg-[#1a1a1a] text-white font-sans p-12 box-border">
      
      {/* --- CABEÇALHO --- */}
      <div className="flex justify-between items-start mb-12 relative">
        <div className="relative z-10">
          <div className="bg-[#1a1a1a] p-2 inline-block transform -rotate-2">
             <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">
              SUA <br /> 
              <span className="text-[#be185d]">AGENDA</span>
             </h1>
          </div>
          <div className="absolute top-4 left-4 w-full h-full bg-[#2d2d2d] -z-10 -rotate-2"></div>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 top-0">
           <img src={logoBase64} alt="Tech Start Summit" className="h-44 w-auto" />
        </div>

        <div className="text-right">
          <div className="bg-white text-black font-bold px-4 py-1 text-xl inline-block mb-1 transform skew-x-[-10deg]">
            <span>            TECH <p className='text-[#be185d] inline'>START</p> SUMMIT</span>
          </div>
          <h2 className="text-3xl font-bold uppercase mt-2">{user.name}</h2>
          <p className="text-[#be185d] font-bold text-xl uppercase tracking-widest">{user.role}</p>
        </div>
      </div>

      {/* --- INFO BAR --- */}
      <div className="flex justify-between items-center mb-10 border-b-2 border-[#333] pb-6">
        <div className="flex gap-4">
           <span className="bg-[#e5e5e5] text-black font-bold px-3 py-1 text-sm transform skew-x-[-10deg]">
             30 E 31 DE MAIO
           </span>
           <span className="bg-[#e5e5e5] text-black font-bold px-3 py-1 text-sm transform skew-x-[-10deg]">
             09:00 - 21:30
           </span>
        </div>
        
        <div className="bg-[#e5e5e5] text-black font-bold px-3 py-1 text-sm transform skew-x-[-10deg]">
             EXPO FIEP • CURITIBA - PR
        </div>

        <div className="bg-[#e5e5e5] text-black font-bold px-3 py-1 text-sm transform skew-x-[-10deg]">
             {items.length} ATIVIDADES SALVAS
        </div>
      </div>

      {/* --- CONTEÚDO (DIAS) --- */}
      <div className="space-y-16">
        {sortedDays.map((day, index) => (
          <div key={day}>
            
            {/* Cabeçalho do Dia */}
            <div className="flex items-center gap-4 mb-10 border-l-4 border-[#be185d] pl-4 break-after-avoid">
                <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white">
                    {daySequenceLabels[index] || `${index + 1}º DIA`}
                </h3>
                <span className="text-[#666] font-bold text-xl tracking-widest mt-1">
                    {/* // {day.split('-').reverse().slice(0, 2).join('/')} */}
                </span>
                <div className="h-px bg-[#333] flex-1 ml-4"></div>
            </div>

            {/* Grid de Cards */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-12">
              {groupedItems[day].map((item) => (
                <div key={item.id} className="relative group break-inside-avoid page-break-avoid">
                  
                  <div className="absolute -top-5 left-0 z-20 bg-[#0f0f0f] text-white px-4 py-2 text-2xl font-bold transform -rotate-2 border-2 border-[#333] shadow-lg">
                    {item.time || 'FIXO'}
                  </div>

                  <div className="bg-[#e5e5e5] text-black p-6 pt-10 relative shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
                    
                    <div className="absolute top-2 right-4 text-xs font-bold uppercase opacity-60 flex items-center gap-1">
                      {item.track ? `${item.track} 📍` : 'PALCO PRINCIPAL 📍'}
                    </div>

                    <h4 className="text-xl font-black leading-tight mb-3 min-h-[3.5rem] line-clamp-2">
                      {item.nome}
                    </h4>

                    {/* --- ÁREA DE APRESENTADORES (ATUALIZADA) --- */}
                    <div className="mb-4">
                      {item.presenters && item.presenters.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {item.presenters.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                               {/* Emoji condicional: Prédio ou Pessoa */}
                               <span className="text-[#be185d] text-lg">
                                 {p.type === 'company' ? '🏢' : '👤'}
                               </span>
                               <span>{p.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Fallback antigo
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                           <span className="text-[#be185d] text-lg">👤</span>
                           {item.speakerNames && item.speakerNames.length > 0 
                             ? item.speakerNames.join(", ") 
                             : "TBA"}
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-300 flex justify-between items-center text-xs font-bold uppercase tracking-wide text-gray-600">
                        <span className="bg-black text-white px-2 py-0.5 rounded-sm">
                          {item.tipoConteudo || 'Talk'}
                        </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};