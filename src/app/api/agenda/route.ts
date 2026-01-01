import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";
import type {
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

type Speaker = {
  id: string;
  nome: string;
};

function isPage(
  item: QueryDatabaseResponse["results"][number]
): item is PageObjectResponse {
  return item.object === "page";
}

export async function GET() {
  try {
    const speakersResponse = await notion.databases.query({
      database_id: process.env.NOTION_SPEAKERS_DATABASE_ID!,
      filter: { property: "Visible", checkbox: { equals: true } },
    });

    const speakers: Speaker[] = speakersResponse.results
      .filter(isPage)
      .map(page => {
        const p = page.properties;
        return {
          id: page.id,
          nome:
            p.Nome?.type === "title"
              ? p.Nome.title[0]?.plain_text ?? ""
              : "",
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

    const items = response.results
      .filter(isPage)
      .map(page => {
        const p = page.properties;
        const start =
          p.Date?.type === "date" ? p.Date.date?.start ?? null : null;

        const speakerIds =
          p.Palestrante?.type === "relation"
            ? p.Palestrante.relation.map(r => r.id)
            : [];

        const linkedSpeakers = speakerIds
          .map(id => speakers.find(s => s.id === id))
          .filter((s): s is Speaker => Boolean(s));

        return {
          id: page.id,
          nome:
            p.Nome?.type === "title"
              ? p.Nome.title[0]?.plain_text ?? ""
              : "",
          date: start,
          dayKey: start ? start.split("T")[0] : null,
          time: start
            ? new Date(start).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : null,
          speakerNames: linkedSpeakers.map(s => s.nome),
          track:
            p.Track?.type === "select" ? p.Track.select?.name ?? "" : "",
          tipoConteudo:
            p["Tipo de Conteúdo"]?.type === "select"
              ? p["Tipo de Conteúdo"].select?.name ?? ""
              : "",
          description:
            p.Descrição?.type === "rich_text"
              ? p.Descrição.rich_text[0]?.plain_text ?? ""
              : "",
        };
      });

    return NextResponse.json(items, {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao carregar agenda" },
      { status: 500 }
    );
  }
}
