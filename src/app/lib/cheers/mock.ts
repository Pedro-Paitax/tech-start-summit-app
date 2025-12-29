export function validateTicket(cpf: string, email: string) {
  return {
    ticketId: "TICKET-123",
    nomeCompleto: "Usuário Teste",
    cpf,
    email,
    areaInteresse: "Tech",
    euSou: "Desenvolvedor",
    duvida: "Quero aprender mais",
    createdAt: new Date().toISOString(),
  };
}
