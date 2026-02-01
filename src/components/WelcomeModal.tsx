"use client";

import { X, Sparkles, Calendar, Users, Trophy } from "lucide-react";
import { useEffect } from "react";

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
}

export default function WelcomeModal({ isOpen, onClose, userName }: WelcomeModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop com blur forte */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                {/* Header com gradiente */}
                <div className="relative bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 p-6 pb-8">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex flex-col items-center text-center text-white">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                            <Sparkles size={32} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            Bem-vindo{userName ? `, ${userName.split(' ')[0]}` : ''}!
                        </h2>
                        <p className="text-white/90 text-sm">
                            É ótimo ter você no Tech Start Summit
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-[var(--muted-foreground)] text-sm text-center mb-6">
                        Preparamos uma experiência incrível para você. Aqui estão algumas coisas que você pode fazer:
                    </p>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--secondary)]/30 border border-[var(--border)]">
                            <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] shrink-0">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1">
                                    Monte sua agenda
                                </h3>
                                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                                    Escolha as palestras e workshops que mais te interessam
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--secondary)]/30 border border-[var(--border)]">
                            <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] shrink-0">
                                <Users size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1">
                                    Conecte-se com pessoas
                                </h3>
                                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                                    Faça networking e troque ideias com outros participantes
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--secondary)]/30 border border-[var(--border)]">
                            <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] shrink-0">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1">
                                    Participe do Bingo
                                </h3>
                                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                                    Complete desafios e concorra a prêmios incríveis
                                </p>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
                        🎯 Vamos começar escolhendo sua trilha para personalizar sua agenda.
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full mt-6 p-3 font-bold text-base bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-[var(--primary)]/20"
                    >
                        Começar minha jornada
                    </button>
                </div>
            </div>
        </div>
    );
}