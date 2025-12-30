import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";

dotenv.config();
const app = express();
app.use(cors());

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

app.get("/api/agenda", async (_, res) => {
  try {
    const speakersResponse = await notion.databases.query({
      database_id: process.env.NOTION_SPEAKERS_DATABASE_ID!,
      filter: { property: "Visible", checkbox: { equals: true } },
    });
    console.log(speakersResponse.results);


    const speakers = speakersResponse.results.map((page: any) => {
      const p = page.properties;
      return {
        id: page.id,
        nome: p.Nome?.title?.[0]?.plain_text || "",
      };
    });

    const response = await notion.databases.query({
      database_id: process.env.NOTION_PROGRAM_DATABASE_ID!,
      filter: {
        or: [
          { property: "Status", status: { equals: "Aguardando Material" } },
          { property: "Status", status: { equals: "Pronto" } },
        ],
      },
      sorts: [{ property: "Date", direction: "ascending" }],
    });

    console.log(response.results);


    const items = response.results.map((page: any) => {
      const p = page.properties;
      const start = p["Date"]?.date?.start || null;

      const speakerIds =
        p["Palestrante"]?.relation?.map((r: any) => r.id) || [];

      const linkedSpeakers = speakerIds
        .map(id => speakers.find(s => s.id === id))
        .filter(Boolean);

      return {
        id: page.id,
        nome: p.Nome?.title?.[0]?.plain_text || "",
        date: start,
        dayKey: start ? start.split("T")[0] : null,
        time: start
          ? new Date(start).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null,
        speakerNames: linkedSpeakers.map(s => s.nome),
        track: p["Track"]?.select?.name || "",
        tipoConteudo: p["Tipo de Conteúdo"]?.select?.name || "",
        description: p["Descrição"]?.rich_text?.[0]?.plain_text || "",
      };
    });

} catch (e) {
  console.error("ERRO AGENDA:", e);
  res.status(500).json({ error: "Erro ao carregar agenda" });
}
});

app.listen(3333, () => {
  console.log("API rodando em http://localhost:3333");
});
