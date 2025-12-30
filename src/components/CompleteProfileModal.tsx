import { useState, useEffect } from "react";
import { Check, Building, GraduationCap, FileText } from "lucide-react";
import { useUser } from "../contexts/useUser"; 

// 1. Definimos a tipagem estendida aqui para o TS parar de reclamar
interface ExtendedUser {
  perfilCompleto?: boolean;
  academico?: {
    instituicao?: string;
    curso?: string;
  };
}

export default function CompleteProfileModal() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  // Estados do Formulário
  const [formData, setFormData] = useState({
    senioridade: "",
    area: "",
    situacao: "",
    linkedin: "",
    github: "",
    instituicao: "",
    curso: "",
    semestre: "",
    tamanhoCamiseta: "",
    termoImagem: false, 
    termoCompartilhamento: false
  });

  useEffect(() => {
    // Verificação de segurança: Se não tem usuário, não faz nada
    if (!user) return;

    // Cast para o tipo estendido (engana o TS para aceitar nossos campos novos)
    const currentUser = user as unknown as ExtendedUser;

    // Lógica: 
    // 1. Verifica se já salvamos localmente (para persistir entre reloads no navegador)
    const localHasCompleted = localStorage.getItem(`profile_completed_${user.email}`);
    
    // 2. Se o mock diz que falta completar E não salvamos localmente ainda
    if (currentUser.perfilCompleto === false && !localHasCompleted) {
      setIsOpen(true);
      
      // Pré-popula dados
      setFormData(prev => ({
        ...prev,
        instituicao: currentUser.academico?.instituicao || "",
        curso: currentUser.academico?.curso || "",
      }));
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Como estamos sem backend real para gravar, salvamos no navegador
    // para simular que o usuário completou o cadastro.
    if (user?.email) {
        localStorage.setItem(`profile_completed_${user.email}`, "true");
    }

    console.log("Dados Salvos:", formData);
    
    // Fecha o modal
    setIsOpen(false); 
    
    // Opcional: Feedback visual simples
    alert("Perfil atualizado com sucesso! Agora você tem acesso total."); 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[var(--card)] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-[var(--border)] shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] sticky top-0 bg-[var(--card)] z-10">
          <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--foreground)]">
            🚀 Vamos finalizar seu cadastro?
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Precisamos de algumas informações rápidas para gerar seu crachá e certificado.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Seção 1: Dados Profissionais */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)] flex items-center gap-2">
              <Building size={16} /> Profissional
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-xs font-medium text-[var(--foreground)]">Nível de Senioridade</label>
                 <select 
                    className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none transition-colors"
                    value={formData.senioridade}
                    onChange={e => setFormData({...formData, senioridade: e.target.value})}
                 >
                   <option value="">Selecione...</option>
                   <option value="Estudante">Estudante</option>
                   <option value="Junior">Júnior</option>
                   <option value="Pleno">Pleno</option>
                   <option value="Senior">Sênior</option>
                 </select>
               </div>
               
               <div className="space-y-1">
                 <label className="text-xs font-medium text-[var(--foreground)]">Área de Interesse</label>
                 <select 
                    className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none transition-colors"
                    value={formData.area}
                    onChange={e => setFormData({...formData, area: e.target.value})}
                 >
                   <option value="">Selecione...</option>
                   <option value="Backend">Backend / Dados</option>
                   <option value="Frontend">Frontend / Mobile</option>
                   <option value="Design">Design / Produto</option>
                 </select>
               </div>

               <div className="space-y-1 md:col-span-2">
                 <label className="text-xs font-medium text-[var(--foreground)]">LinkedIn (Opcional)</label>
                 <input 
                    type="text" 
                    placeholder="https://linkedin.com/in/..."
                    className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none transition-colors"
                    value={formData.linkedin}
                    onChange={e => setFormData({...formData, linkedin: e.target.value})}
                 />
               </div>
            </div>
          </div>

          <div className="h-px bg-[var(--border)]" />

          {/* Seção 2: Acadêmico */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)] flex items-center gap-2">
              <GraduationCap size={16} /> Acadêmico
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-xs font-medium text-[var(--foreground)]">Instituição</label>
                 <input 
                    type="text" 
                    className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none transition-colors"
                    value={formData.instituicao}
                    onChange={e => setFormData({...formData, instituicao: e.target.value})}
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-medium text-[var(--foreground)]">Curso</label>
                 <input 
                    type="text" 
                    className="w-full p-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none transition-colors"
                    value={formData.curso}
                    onChange={e => setFormData({...formData, curso: e.target.value})}
                 />
               </div>
            </div>
          </div>

          <div className="h-px bg-[var(--border)]" />

          {/* Seção 3: Outros & Termos (OBRIGATÓRIO) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)] flex items-center gap-2">
              <FileText size={16} /> Termos de Uso
            </h3>
            
            <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--foreground)]">Tamanho da Camiseta</label>
                <div className="flex gap-2 mt-1">
                    {['P', 'M', 'G', 'GG', 'XG'].map(size => (
                        <button
                            key={size}
                            type="button"
                            onClick={() => setFormData({...formData, tamanhoCamiseta: size})}
                            className={`h-8 w-10 text-xs rounded border transition-colors
                                ${formData.tamanhoCamiseta === size 
                                ? 'bg-[var(--primary)] text-white border-[var(--primary)]' 
                                : 'bg-[var(--secondary)] border-[var(--border)] hover:bg-[var(--border)] text-[var(--foreground)]'}`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg space-y-3 mt-4">
                <div className="flex gap-3 items-start">
                    <input 
                        type="checkbox" 
                        id="termImage"
                        className="mt-1"
                        required 
                        checked={formData.termoImagem}
                        onChange={e => setFormData({...formData, termoImagem: e.target.checked})}
                    />
                    <label htmlFor="termImage" className="text-xs text-[var(--foreground)] cursor-pointer leading-tight">
                        <span className="font-bold text-amber-600 dark:text-amber-500">Obrigatório:</span> Autorizo o uso da minha imagem em fotos e vídeos do evento para fins de divulgação.
                    </label>
                </div>

                <div className="flex gap-3 items-start">
                    <input 
                        type="checkbox" 
                        id="termShare"
                        className="mt-1"
                        required
                        checked={formData.termoCompartilhamento}
                        onChange={e => setFormData({...formData, termoCompartilhamento: e.target.checked})}
                    />
                    <label htmlFor="termShare" className="text-xs text-[var(--foreground)] cursor-pointer leading-tight">
                        <span className="font-bold text-amber-600 dark:text-amber-500">Obrigatório:</span> Aceito compartilhar meus dados profissionais (LinkedIn, Senioridade) com patrocinadores para recrutamento.
                    </label>
                </div>
            </div>
          </div>

          {/* Footer Sticky */}
          <div className="pt-4 sticky bottom-0 bg-[var(--card)] border-t border-[var(--border)] -mx-6 px-6 pb-0">
             <button 
                type="submit"
                disabled={!formData.termoImagem || !formData.termoCompartilhamento}
                className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 mb-2"
             >
                <Check size={18} />
                Salvar e Acessar
             </button>
             {!formData.termoImagem && (
                 <p className="text-[10px] text-center text-red-500 pb-2">
                     * Você precisa aceitar os termos obrigatórios para continuar.
                 </p>
             )}
          </div>

        </form>
      </div>
    </div>
  );
}