import fs from "fs";
import path from "path";
import { chromium } from "playwright";

interface AgendaItem {
  id: string;
  nome: string;
  time: string;
  dayLabel: string;
  speakerNames?: string[];
}

export async function generateAgendaPDF(
  items: AgendaItem[],
  userName: string
): Promise<Buffer> {
  const templatePath = path.resolve(
    "server/templates/agenda.html"
  );

  let html = fs.readFileSync(templatePath, "utf-8");

  const grouped: Record<string, AgendaItem[]> = {};

  items.forEach((item) => {
    if (!grouped[item.dayLabel]) {
      grouped[item.dayLabel] = [];
    }
    grouped[item.dayLabel].push(item);
  });

  let content = "";

  for (const day of Object.keys(grouped)) {
    content += `
      <div class="day">
        <div class="day-title">${day}</div>

        ${grouped[day]
          .map(
            (item) => `
              <div class="item">
                <div class="time">${item.time}</div>
                <div class="content">
                  <div class="name">${item.nome}</div>
                  <div class="speaker">
                    ${item.speakerNames?.join(", ") || ""}
                  </div>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  html = html.replace("{{CONTENT}}", content);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "load" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  return pdf;
}
