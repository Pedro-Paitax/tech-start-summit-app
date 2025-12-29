import { NextResponse } from "next/server";
import { validateTicket } from "../../../lib/cheers/mock";

export async function POST(req: Request) {
  const { cpf, email } = await req.json();

  if (!cpf || !email) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const user = validateTicket(cpf, email);

  const res = NextResponse.json({ success: true });

  res.cookies.set("session", user.ticketId, {
    httpOnly: true,
    path: "/",
  });

  return res;
}
