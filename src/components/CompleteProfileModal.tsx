"use client";

import { useState, useEffect } from "react";
import { useUser } from "../contexts/useUser";
import { auth, db } from "../app/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Briefcase, GraduationCap, Shirt, 
  Save, Loader2, AlertCircle, Sparkles, Check, 
  MessageCircleQuestion, ArrowRight, Lightbulb, Tag
} from "lucide-react";

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CompleteProfileModal({ isOpen, onClose }: CompleteProfileModalProps) {
  const { userData, user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    apelido: "",
    senioridade: "Júnior",
    areaInteresse: "Frontend",
    situacaoAtual: "Estudante",
    linkedin: "",
    github: "",
    instituicao: "",
    curso: "",
    semestre: "1",
    tamanhoCamiseta: "M",
    usoImagem: false,
    compartilhamento: false,
    duvida: "" 
  });

  useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

useEffect(() => {
  if (!userData) return;

  setFormData(prev => ({
    ...prev,
    apelido: userData.apelido ?? prev.apelido,
    senioridade: userData.senioridade ?? prev.senioridade,
    areaInteresse: userData.areaInteresse ?? prev.areaInteresse,
    situacaoAtual: userData.situacaoAtual ?? prev.situacaoAtual,
    linkedin: userData.linkedin ?? prev.linkedin,
    github: userData.github ?? prev.github,
    instituicao: userData.instituicao ?? prev.instituicao,
    curso: userData.curso ?? prev.curso,
    semestre: userData.semestre ?? prev.semestre,
    tamanhoCamiseta: userData.tamanhoCamiseta ?? prev.tamanhoCamiseta,
    usoImagem: Boolean(userData.usoImagem),
    compartilhamento: Boolean(userData.compartilhamento),
    duvida: typeof userData.duvida === "string" ? userData.duvida : ""
  }));
}, [userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleManualChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");

    // --- PASSO 1: DADOS ---
    if (step === 1) {
        if (!formData.apelido) {
            setError("Por favor, preencha o Nome do Crachá para continuar.");
            return;
        }
        setStep(2);
        return;
    }

    if (step === 2) {
        if (!formData.duvida || formData.duvida.length < 3) {
            setError("Por favor, digite sua dúvida.");
            return;
        }

        setLoading(true);

        try {
            const userRef = doc(db, "users", user.uid);
            
            const payload = {
                ...formData,
                profileCompleted: true,
                updatedAt: new Date().toISOString()
            };

            await updateDoc(userRef, payload);
            
            setTimeout(() => {
                onClose();
            }, 1000);

        } catch (err) {
            console.error("Erro ao salvar:", err);
            setError("Erro ao salvar dados. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            
            {/* CABEÇALHO */}
            <div className="p-6 border-b border-[var(--border)] bg-[var(--secondary)]/20 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[var(--primary)]/20 rounded-lg">
                        {step === 1 ? (
                            <Sparkles className="text-[var(--primary)]" size={24} />
                        ) : (
                            <MessageCircleQuestion className="text-[var(--primary)]" size={24} />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">
                            {step === 1 ? "Quase lá!" : "A Pergunta de Milhões"}
                        </h2>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {step === 1 
                            ? "Complete seu perfil para acessar o evento." 
                            : "Essa informação é essencial para sua identificação."}
                        </p>
                    </div>
                </div>
                {error && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs font-bold text-red-500 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={14}/> {error}
                    </div>
                )}
            </div>

            {/* CORPO DO MODAL */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 pr-2 
                [&::-webkit-scrollbar]:w-1.5 
                [&::-webkit-scrollbar-track]:bg-transparent 
                [&::-webkit-scrollbar-thumb]:bg-[var(--muted-foreground)]/20 
                [&::-webkit-scrollbar-thumb]:rounded-full 
                hover:[&::-webkit-scrollbar-thumb]:bg-[var(--primary)]
                transition-colors"
            >
                <form id="profile-form" onSubmit={handleAction} className="space-y-8">
                    
                    {/* --- PASSO 1: DADOS --- */}
                    <div className={step === 1 ? "block" : "hidden"}>
                        <section className="space-y-4">
                            <h3 className="flex items-center gap-2 text-[var(--primary)] font-bold text-sm uppercase tracking-wider border-b border-[var(--border)] pb-2">
                                <User size={16} /> Dados Pessoais
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase mb-1 block">Apelido (Crachá) *</label>
                                    <input type="text" name="apelido" value={formData.apelido} onChange={handleChange} 
                                        className="w-full p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-bold text-lg" 
                                        placeholder="Como quer ser chamado" />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 pt-4">
                            <h3 className="flex items-center gap-2 text-[var(--primary)] font-bold text-sm uppercase tracking-wider border-b border-[var(--border)] pb-2">
                                <Briefcase size={16} /> Preferências Profissionais
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase mb-1 block">Senioridade</label>
                                    <select name="senioridade" value={formData.senioridade} onChange={handleChange} 
                                        className="w-full p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] outline-none text-sm">
                                        <option>Nenhuma</option>
                                        <option>Estagiário</option>
                                        <option>Júnior</option>
                                        <option>Pleno</option>
                                        <option>Sênior</option>
                                        <option>Especialista</option>
                                        <option>Lead/Manager</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase mb-1 block">Área de Interesse</label>
                                    <select name="areaInteresse" value={formData.areaInteresse} onChange={handleChange} 
                                        className="w-full p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] outline-none text-sm">
                                        <option>Frontend</option>
                                        <option>Backend</option>
                                        <option>Fullstack</option>
                                        <option>Mobile</option>
                                        <option>Dados / IA</option>
                                        <option>Design / UX</option>
                                        <option>Produto</option>
                                        <option>DevOps / Cloud</option>
                                        <option>QA / Testes</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase mb-1 block">Situação Atual</label>
                                    <select name="situacaoAtual" value={formData.situacaoAtual} onChange={handleChange} 
                                        className="w-full p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] outline-none text-sm">
                                        <option>Estudante</option>
                                        <option>Empregado</option>
                                        <option>Desempregado</option>
                                        <option>Empreendedor</option>
                                        <option>Transição de Carreira</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase mb-1 block">LinkedIn (URL)</label>
                                    <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} 
                                        className="w-full p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all" placeholder="https://linkedin.com/in/..." />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase mb-1 block">Github / Portfólio (URL)</label>
                                    <input type="text" name="github" value={formData.github} onChange={handleChange} 
                                        className="w-full p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all" placeholder="https://github.com/..." />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 pt-4">
                            <h3 className="flex items-center gap-2 text-[var(--primary)] font-bold text-sm uppercase tracking-wider border-b border-[var(--border)] pb-2">
                                <GraduationCap size={16} /> Acadêmico
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase mb-1 block">Instituição</label>
                                    <input type="text" name="instituicao" value={formData.instituicao} onChange={handleChange} 
                                        className="w-full p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all" placeholder="Nome da Faculdade" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase mb-1 block">Curso</label>
                                    <input type="text" name="curso" value={formData.curso} onChange={handleChange} 
                                        className="w-full p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase mb-1 block">Semestre</label>
                                    <select name="semestre" value={formData.semestre} onChange={handleChange} 
                                        className="w-full p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] outline-none text-sm">
                                        {[...Array(10)].map((_, i) => <option key={i} value={i+1}>{i+1}º Semestre</option>)}
                                        <option value="Concluido">Concluído</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 pt-4">
                            <h3 className="flex items-center gap-2 text-[var(--primary)] font-bold text-sm uppercase tracking-wider border-b border-[var(--border)] pb-2">
                                <Shirt size={16} /> Extras
                            </h3>
                            
                            <div>
                                <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2 block">Tamanho da Camiseta</label>
                                <div className="flex gap-2 flex-wrap">
                                    {['P', 'M', 'G', 'GG', 'XG'].map(size => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => handleManualChange('tamanhoCamiseta', size)}
                                            className={`w-12 h-12 rounded-xl font-bold text-sm transition-all border ${
                                                formData.tamanhoCamiseta === size 
                                                ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20 scale-105' 
                                                : 'bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--primary)]'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="flex items-start gap-3 p-3 border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--secondary)]/20 transition-all group select-none">
                                    <div className="relative flex items-center justify-center mt-0.5">
                                        <input type="checkbox" name="usoImagem" checked={formData.usoImagem} onChange={handleChange} className="peer sr-only" />
                                        <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${formData.usoImagem ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-[var(--muted-foreground)]/40 bg-[var(--background)] group-hover:border-[var(--primary)]'}`}>
                                            <Check size={12} strokeWidth={4} className={`text-white transition-transform ${formData.usoImagem ? 'scale-100' : 'scale-0'}`} />
                                        </div>
                                    </div>
                                    <span className="text-xs text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
                                        Autorizo o uso da minha imagem em fotos e vídeos para divulgação do evento Tech Start Summit.
                                    </span>
                                </label>
                                
                                <label className="flex items-start gap-3 p-3 border border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--secondary)]/20 transition-all group select-none">
                                    <div className="relative flex items-center justify-center mt-0.5">
                                        <input type="checkbox" name="compartilhamento" checked={formData.compartilhamento} onChange={handleChange} className="peer sr-only" />
                                        <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${formData.compartilhamento ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-[var(--muted-foreground)]/40 bg-[var(--background)] group-hover:border-[var(--primary)]'}`}>
                                            <Check size={12} strokeWidth={4} className={`text-white transition-transform ${formData.compartilhamento ? 'scale-100' : 'scale-0'}`} />
                                        </div>
                                    </div>
                                    <span className="text-xs text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
                                        Aceito compartilhar meu currículo/LinkedIn com as empresas patrocinadoras para eventuais vagas.
                                    </span>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* --- PASSO 2: A GRANDE DÚVIDA (MODIFICADO) --- */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={step === 2 ? { opacity: 1, x: 0 } : {}}
                        className={step === 2 ? "block space-y-6" : "hidden"}
                    >
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] mb-2">
                                <Lightbulb size={32} />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">Qual a sua maior dúvida de carreira?</h3>
                            
                            {/* AVISO DO CRACHÁ */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--secondary)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)]">
                                <Tag size={14} className="text-[var(--primary)]"/>
                                INFORMAÇÃO VISÍVEL NO CRACHÁ
                            </div>
                            
                            <p className="text-[var(--muted-foreground)] text-sm px-4">
                                Essa pergunta será impressa no verso do seu crachá. Capriche! É uma ótima forma de começar conversas (Networking) durante o evento.
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2 block">Sua Dúvida</label>
                            
                            {/* INPUT DE TEXTO SOLICITADO */}
                            <input
                                type="text"
                                name="duvida"
                                value={formData.duvida}
                                onChange={handleChange}
                                placeholder="Ex: Desenvolvedores Vão Existir Daqui a 5 anos?"
                                maxLength={60}
                                className="w-full p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all text-lg font-medium shadow-sm"
                            />
                            
                            <div className="text-right mt-1">
                                <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-bold tracking-wider">
                                    {formData.duvida.length}/60
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Sugestões Rápidas</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {[
                                    "Devo focar em Frontend ou Backend?",
                                    "Como conseguir a primeira vaga?",
                                    "A IA vai substituir programadores?",
                                    "Faculdade ainda é importante?",
                                    "Dicas para arrasar na entrevista comportamental?",
                                    "O que fazer de primeiro portfólio?"
                                ].map((sugestao, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleManualChange('duvida', sugestao)}
                                        className="text-xs py-2 px-3 rounded-lg border border-[var(--border)] bg-[var(--secondary)]/30 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-colors"
                                    >
                                        {sugestao}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </motion.div>

                </form>
            </div>

            <div className="p-6 border-t border-[var(--border)] bg-[var(--card)]">
                <button
                    onClick={handleAction}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[var(--primary)] hover:opacity-90 text-white p-4 rounded-xl font-bold text-lg shadow-xl shadow-[var(--primary)]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" />
                    ) : step === 1 ? (
                        <>Continuar <ArrowRight size={20} /></>
                    ) : (
                        <> <Save size={20} /> Finalizar Cadastro</>
                    )}
                    {loading && "Salvando..."}
                </button>
                
                {step === 2 && !loading && (
                    <button 
                        onClick={() => setStep(1)}
                        className="w-full mt-3 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline decoration-dotted"
                    >
                        Voltar e editar meus dados
                    </button>
                )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}