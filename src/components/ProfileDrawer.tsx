"use client";

import { useState, useEffect } from "react";
import { useUser } from "../contexts/useUser";
import { auth, db } from "../app/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User, Mail, Linkedin, Github, 
  School, Briefcase, Shirt, LogOut, 
  ChevronDown, Save, Loader2, Phone, FileBadge,
  CheckCircle2, AlertCircle, RefreshCw, AlertTriangle
} from "lucide-react";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = {
  type: 'success' | 'error';
  message: string;
  shouldReload?: boolean;
} | null;

export function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const { userData, user } = useUser();
  
  const [formData, setFormData] = useState<any>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        nomeCompleto: userData.nomeCompleto || "",
        senioridade: userData.senioridade || "",
        instituicao: userData.instituicao || "",
        curso: userData.curso || "",
        tamanhoCamiseta: userData.tamanhoCamiseta || "",
        linkedin: userData.linkedin || "",
        github: userData.github || "",
        telefone: userData.telefone || "",
        cpf: userData.cpf || ""
      });
    }
  }, [userData, isOpen]);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, formData);
      setFeedback({ type: 'success', message: "Perfil atualizado com sucesso!" });
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: "Não foi possível salvar as alterações." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetClick = () => {
    setShowResetConfirmation(true);
  };

  const confirmReset = async () => {
    if (!user) return;
    
    setShowResetConfirmation(false);
    setIsSaving(true);
    
    try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            bingo_cards: [],     
            bingo_progress: []   
        });

        setFeedback({ 
            type: 'success', 
            message: "Cartela resetada! Clique em OK para recarregar a página.",
            shouldReload: true 
        });

    } catch (error) {
        console.error(error);
        setFeedback({ type: 'error', message: "Erro ao resetar a cartela." });
        setIsSaving(false);
    }
  };

  const handleCloseFeedback = () => {
    if (feedback?.shouldReload) {
        window.location.reload();
        return;
    }

    if (feedback?.type === 'success') {
      setFeedback(null);
      onClose();
    } else {
      setFeedback(null);
    }
  };

  const InputRow = ({ icon: Icon, label, field, placeholder, disabled = false }: any) => (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--secondary)]/30 border border-[var(--border)] focus-within:border-[var(--primary)] focus-within:bg-[var(--secondary)] transition-all">
      <div className="text-[var(--primary)]">
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <input 
          type="text"
          disabled={disabled}
          value={formData[field] || (disabled ? user?.email : "")}
          onChange={(e) => handleChange(field, e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-sm font-medium text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[var(--card)] z-[9999] shadow-2xl border-l border-[var(--border)] flex flex-col"
          >
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <User className="text-[var(--primary)]" />
                Meu Perfil
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-[var(--secondary)] rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-[var(--secondary)] border-4 border-[var(--background)] shadow-xl flex items-center justify-center text-3xl font-black text-[var(--primary)] mb-3 relative group">
                    {formData.nomeCompleto?.charAt(0) || user?.email?.charAt(0)}
                    <div className="absolute bottom-0 right-0 bg-[var(--primary)] p-1.5 rounded-full border-2 border-[var(--background)]">
                        <User size={12} className="text-white"/>
                    </div>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {user?.email}
                </p>
              </div>

              <div className="space-y-3 mb-4">
                 <InputRow icon={User} label="Nome Completo" field="nomeCompleto" placeholder="Seu nome" />
                 <InputRow icon={Mail} label="E-mail" field="email" disabled />
                 <InputRow icon={Phone} label="Telefone / WhatsApp" field="telefone" placeholder="(00) 00000-0000" />
                 <InputRow icon={FileBadge} label="CPF" field="cpf" disabled />
              </div>

              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between group py-3 px-2 border-t border-b border-[var(--border)] my-2 hover:bg-[var(--secondary)]/50 transition-colors"
              >
                 <span className="text-xs font-bold uppercase text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors">
                    {isExpanded ? "Ocultar Detalhes Extras" : "Ver Mais Informações"}
                 </span>
                 <motion.div 
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                 >
                    <ChevronDown size={18} className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)]" />
                 </motion.div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-3 py-2">
                            <InputRow icon={Briefcase} label="Cargo / Senioridade" field="senioridade" placeholder="Ex: Junior, Estudante..." />
                            <InputRow icon={School} label="Instituição de Ensino" field="instituicao" placeholder="Sua faculdade" />
                            <InputRow icon={School} label="Curso" field="curso" placeholder="Seu curso" />
                            <InputRow icon={Shirt} label="Tamanho da Camiseta" field="tamanhoCamiseta" placeholder="P, M, G..." />
                            <div className="h-px bg-[var(--border)] my-2" />
                            <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">Redes Sociais</p>
                            <InputRow icon={Linkedin} label="URL do LinkedIn" field="linkedin" placeholder="https://linkedin.com/in/..." />
                            <InputRow icon={Github} label="URL do GitHub" field="github" placeholder="https://github.com/..." />
                        </div>
                    </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 pt-6 border-t border-[var(--border)] border-dashed">
                 <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-3 text-center">
                    Zona de Perigo
                 </p>
                 <button
                    onClick={handleResetClick}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 border border-red-500/30 hover:bg-red-500/10 text-red-500 font-bold py-3 rounded-xl transition-all text-xs"
                 >
                    <RefreshCw size={16} />
                    RESETAR MINHA CARTELA DE BINGO
                 </button>
                 <p className="text-[10px] text-center text-[var(--muted-foreground)] mt-2">
                    Isso apagará seu progresso e gerará missões novas.
                 </p>
              </div>

            </div>

            <div className="p-6 border-t border-[var(--border)] bg-[var(--secondary)]/30 space-y-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 bg-[var(--primary)] hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[var(--primary)]/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                {isSaving ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/5 font-bold py-3 rounded-xl transition-all text-sm"
              >
                <LogOut size={16} />
                Sair da Conta
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {showResetConfirmation && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowResetConfirmation(false)}
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-[var(--card)] w-full max-w-xs p-6 rounded-2xl border border-[var(--border)] shadow-2xl flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-red-500/10 text-red-500">
              <AlertTriangle size={32} />
            </div>

            <h3 className="text-lg font-black uppercase mb-2">
              Tem certeza?
            </h3>

            <p className="text-sm text-[var(--muted-foreground)] mb-6 leading-relaxed">
              Você perderá todo o progresso atual e seus checks. Uma nova cartela será gerada com base nos seus favoritos atuais.
            </p>

            <div className="flex flex-col gap-2 w-full">
              <button 
                onClick={confirmReset}
                className="w-full font-bold py-3 rounded-xl transition-all bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
              >
                SIM, RESETAR TUDO
              </button>
              <button 
                onClick={() => setShowResetConfirmation(false)}
                className="w-full font-bold py-3 rounded-xl transition-all bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-[var(--foreground)]"
              >
                CANCELAR
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {feedback && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCloseFeedback}
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-[var(--card)] w-full max-w-xs p-6 rounded-2xl border border-[var(--border)] shadow-2xl flex flex-col items-center text-center"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              feedback.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {feedback.type === 'success' 
                ? <CheckCircle2 size={32} /> 
                : <AlertCircle size={32} />
              }
            </div>

            <h3 className="text-lg font-black uppercase mb-2">
              {feedback.type === 'success' ? 'Tudo Certo!' : 'Ops!'}
            </h3>

            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              {feedback.message}
            </p>

            <button 
              onClick={handleCloseFeedback}
              className={`w-full font-bold py-3 rounded-xl transition-all ${
                feedback.type === 'success' 
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20' 
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
              }`}
            >
              {feedback.type === 'success' ? 'OK, FECHAR' : 'TENTAR NOVAMENTE'}
            </button>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}