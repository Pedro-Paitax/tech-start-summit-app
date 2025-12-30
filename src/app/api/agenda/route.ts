import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export default async function handler(req, res) {
  try {
    const speakersResponse = await notion.databases.query({
      database_id: process.env.NOTION_SPEAKERS_DATABASE_ID!,
      filter: { property: "Visible", checkbox: { equals: true } },
    });

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

    const items = response.results.map((page: any) => {
      const p = page.properties;

      const speakerIds =
        p["Palestrante"]?.relation?.map((r: any) => r.id) || [];

      const linkedSpeakers = speakerIds
        .map(id => speakers.find(s => s.id === id))
        .filter(Boolean);

      return {
        id: page.id,
        nome: p.Nome?.title?.[0]?.plain_text || "",
        date: p["Date"]?.date?.start || null,
        dayKey: p["Date"]?.date?.start
          ? p["Date"].date.start.split("T")[0]
          : null,
        time: p["Date"]?.date?.start
          ? new Date(p["Date"].date.start).toLocaleTimeString("pt-BR", {
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

    res.setHeader(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=300"
    );

    console.log(items)
    res.status(200).json(items);
  } catch (e) {
    res.status(500).json({ error: "Erro ao carregar agenda" });
  }
}
