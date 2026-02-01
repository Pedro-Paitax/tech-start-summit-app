import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";
import type { PageObjectResponse, QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import { getCachedData } from "../../lib/simpleCache"; 

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });

function isPage(item: any): item is PageObjectResponse {
  return item.object === "page";
}

async function fetchFromNotion() {
    const [speakersRes, entitiesRes, programRes] = await Promise.all([
      notion.databases.query({
        database_id: process.env.NOTION_SPEAKERS_DATABASE_ID!,
        filter: { property: "Visible", checkbox: { equals: true } },
      }),
      notion.databases.query({
        database_id: process.env.NOTION_ENTITYS_DATABASE_ID!,
        filter: { property: "Acordo Formalizado", checkbox: { equals: true } },
      }),
      notion.databases.query({
        database_id: process.env.NOTION_PROGRAM_DATABASE_ID!,
        filter: {
          or: [
            { property: "Status", status: { equals: "Aguardando Material" } },
            { property: "Status", status: { equals: "Pronto" } },
          ],
        },
        sorts: [{ property: "Date", direction: "ascending" }],
      }),
    ]);
    return { speakersRes, entitiesRes, programRes };
} 

export async function GET() {
  try {
    const { speakersRes, entitiesRes, programRes } = await getCachedData(
        "agenda_raw_data", 
        fetchFromNotion, 
        600 
    );
    const speakersMap = speakersRes.results.filter(isPage).map((page) => {
        const p = page.properties;
        const rawQnA = p.BingoQnA?.type === "rich_text" ? p.BingoQnA.rich_text[0]?.plain_text : "";
        const bingoQuestions = rawQnA
            ? rawQnA.split('\n').filter(line => line.includes('::')).map(line => {
                const [q, a] = line.split('::');
                return { question: q.trim(), code: a.trim().toUpperCase() };
            })
            : [];
        return {
          id: page.id,
          nome: p.Nome?.type === "title" ? p.Nome.title[0]?.plain_text ?? "" : "",
          bingoOptions: bingoQuestions 
        };
    });

    const entitiesMap = entitiesRes.results.filter(isPage).map((page) => {
        const p = page.properties;
        return {
          id: page.id,
          nome: p.Nome?.type === "title" ? p.Nome.title[0]?.plain_text ?? "" : "",
        };
    });

    const agendaItems = programRes.results.filter(isPage).map((page) => {
        const p = page.properties;
        const speakerIds = p.Palestrante?.type === "relation" ? p.Palestrante.relation.map((r) => r.id) : [];
        const linkedSpeakers = speakerIds.map((id) => speakersMap.find((s) => s.id === id)).filter(Boolean); 
        const entityRelation = (p["Empresa"] || p["Entidade"] || p["Parceiro"]) as any;
        const entityIds = entityRelation?.type === "relation" ? entityRelation.relation.map((r: any) => r.id) : [];
        const linkedEntities = entityIds.map((id: string) => entitiesMap.find((e) => e.id === id)).filter(Boolean);

        const presenters = [
            ...linkedSpeakers.map(s => ({ name: s!.nome, type: 'person', bingoOptions: s!.bingoOptions })),
            ...linkedEntities.map((e: any) => ({ name: e!.nome, type: 'company', bingoOptions: [] }))
        ];
        const start = p.Date?.type === "date" ? p.Date.date?.start : null;
        
        return {
          id: page.id,
          nome: p.Nome?.type === "title" ? p.Nome.title[0]?.plain_text : "",
          date: start,
          dayKey: start ? new Date(start).toISOString().split("T")[0] : null,
          dayLabel: start ? new Date(start).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }) : null,
          time: start ? new Date(start).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : null,
          presenters,
          speakerNames: presenters.map(p => p.name),
          track: p.Track?.type === "select" ? p.Track.select?.name : "",
          tipoConteudo: p["Tipo de Conteúdo"]?.type === "select" ? p["Tipo de Conteúdo"].select?.name : "",
          status: p.Status?.type === "status" ? p.Status.status?.name : "",
          publico: p["Público-Alvo"]?.type === "select" ? p["Público-Alvo"].select?.name : "",
          area: p["Área Foco"]?.type === "multi_select" ? p["Área Foco"].multi_select.map((t) => t.name) : [],
          tags: p.Tags?.type === "multi_select" ? p.Tags.multi_select.map((t) => t.name) : [],
          topics: p["Tópicos Chave"]?.type === "rich_text" ? p["Tópicos Chave"].rich_text[0]?.plain_text : "",
          description: p.Descrição?.type === "rich_text" ? p.Descrição.rich_text[0]?.plain_text : "",
          bigDescription: p["Descrição Longa"]?.type === "rich_text" ? p["Descrição Longa"].rich_text[0]?.plain_text : "",
        };
    });

    return NextResponse.json(agendaItems, { headers: { ...corsHeaders, "Cache-Control": "s-maxage=600" } });

  } catch (err) {
    console.error("ERRO API AGENDA:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}