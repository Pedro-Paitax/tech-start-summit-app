export const runtime = "nodejs";


import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright-core";
import chromiumLambda from "@sparticuz/chromium";

export async function POST(req: NextRequest) {
  try {
    const { items, userName } = await req.json();

const browser = await chromium.launch({
  headless: true,
});

    const page = await browser.newPage({
      viewport: { width: 1240, height: 1754 }, // A4 em px
    });

    const html = generateHTML(items, userName);

    await page.setContent(html, { waitUntil: "networkidle" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
    });

    await browser.close();
  console.log("PDF size:", pdf.length);

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="minha-agenda-techsummit.pdf"',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao gerar PDF" },
      { status: 500 }
    );
  }
}
function generateHTML(items: any[], userName: string) {
  const grouped = groupByDay(items);
  const logo = 'https://2l1c0a72tw.ufs.sh/f/yEUlE6cUsfMPfdCMoSEbqMCsSxr5ViANnkGWDP7oYH2XmuIE'

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }

  body {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background: #2B2B2B;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 24mm;
    background: #2B2B2B;
    page-break-after: always;
  }

  /* HEADER */
  .header {
    position: relative;
    background: #111;
    padding: 32px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .title-block span {
    font-size: 34px;
    color: white;
    font-weight: 900;
    line-height: 1;
  }

  .title-block h1 {
    font-size: 54px;
    color: #C23B6E;
    font-weight: 900;
    margin: 0;
    line-height: 1;
  }

  .meta {
    margin-top: 12px;
    font-size: 12px;
    color: white;
  }

  /* LOGO SVG */
  .logo {
    width: 96px;
    height: auto;
  }

  /* DIA */
  .day-divider {
    margin: 32px 0 16px;
    color: white;
    font-weight: 700;
    font-size: 14px;
    border-bottom: 2px solid #444;
    padding-bottom: 6px;
  }

  /* GRID */
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  /* CARD */
  .card {
    background: #EAEAEA;
    display: grid;
    grid-template-columns: 70px 1fr;
    border-radius: 6px;
    overflow: hidden;
  }

  .time {
    background: #111;
    color: white;
    font-weight: 900;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .content {
    padding: 12px;
  }

  .track {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    color: #C23B6E;
  }

  .title {
    font-size: 13px;
    font-weight: 700;
    margin: 6px 0;
  }

  .footer {
    font-size: 9px;
    display: flex;
    justify-content: space-between;
    color: #333;
  }

  .type {
    font-weight: 700;
    color: #555;
  }
</style>
</head>

<body>
  <div class="page">

    <div class="header">
      <div class="title-block">
        <span>SUA</span>
        <h1>AGENDA</h1>
        <div class="meta">
          Tech Start Summit<br/>
          ${userName}<br/>
          30 e 31 de Maio • Curitiba - PR
        </div>
      </div>

      <!-- 🔥 LOGO SVG (trocar o src) -->
      <img
        src="${logo}"
        class="logo"
        alt="Logo do evento"
      />
    </div>

    ${Object.entries(grouped)
      .map(
        ([day, talks]: any) => `
      <div class="day-divider">${day}</div>

      <div class="grid">
        ${talks
          .map(
            (t: any) => `
          <div class="card">
            <div class="time">${t.time}</div>
            <div class="content">
              <div class="track">${t.track || "Sala 1"}</div>
              <div class="title">${t.nome}</div>
              <div class="footer">
                <span>${t.speakerNames?.[0] || ""}</span>
                <span class="type">${t.tipoConteudo}</span>
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `
      )
      .join("")}

  </div>
</body>
</html>
`;
}
function groupByDay(items: any[]) {
  const sorted = [...items].sort((a, b) => {
    if (a.dayKey !== b.dayKey) return a.dayKey.localeCompare(b.dayKey);
    return a.time.localeCompare(b.time);
  });

  return sorted.reduce((acc: any, item: any) => {
    acc[item.dayLabel] = acc[item.dayLabel] || [];
    acc[item.dayLabel].push(item);
    return acc;
  }, {});
}
