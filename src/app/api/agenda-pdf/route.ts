import React from "react";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { AgendaTemplate } from "../../../components/AgendaTemplate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export interface AgendaItem {
  id: string;
  nome: string;
  date: string;
  dayKey: string | null;
  dayLabel: string | null;
  time: string | null;
  speakerNames: string[];
  track: string;
  tipoConteudo: string;
  status: string;
  publico: string;
  area: string[];
  tags: string[];
  topics: string;
  description: string;
  bigDescription: string;
}

export interface AgendaRequestBody {
  items: AgendaItem[];
  userName?: string;
  userRole?: string;
}

export async function POST(req: Request) {
  let browser;

  try {
    const ReactDOMServer = (await import("react-dom/server")).default;
    const body: AgendaRequestBody = await req.json();
    const { items, userName, userRole } = body;

    const logoPath = path.join(process.cwd(), "public", "TechStartSummitLogo.svg");
    let logoBase64 = "";

    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = `data:image/svg+xml;base64,${logoBuffer.toString("base64")}`;
    }

const componentHtml = ReactDOMServer.renderToStaticMarkup(
  React.createElement(AgendaTemplate, {
    items,
    user: {
      name: userName || "PARTICIPANTE",
      role: userRole || "INSCRITO",
    },
    logoBase64,
  })
);

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Inter', sans-serif;
              background-color: #1a1a1a;
              margin: 0;
              -webkit-print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          ${componentHtml}
        </body>
      </html>
    `;

    const isProd = process.env.VERCEL_ENV === "production";

    if (isProd) {
      const puppeteer = await import("puppeteer-core");
      const chromium = (await import("@sparticuz/chromium")).default;

      browser = await puppeteer.default.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      const puppeteer = await import("puppeteer");

      browser = await puppeteer.default.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=agenda.pdf",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    return NextResponse.json(
      { error: "Erro interno: " + message },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
