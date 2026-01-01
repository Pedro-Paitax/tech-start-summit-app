import { Client } from "@notionhq/client";
import "dotenv/config";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_ID = process.env.NOTION_PROGRAM_DATABASE_ID!;
const SPEAKERS_DB_ID = process.env.NOTION_SPEAKERS_DATABASE_ID!;

console.log("Token:", process.env.NOTION_API_KEY);
console.log("Database ID:", process.env.NOTION_PROGRAM_DATABASE_ID);

/* ---------------- TIPOS ---------------- */

interface NotionText {
  type: "text";
  text: { content: string };
  plain_text: string;

}

interface NotionTitle {
  type: "title";
  title: NotionText[];
}

interface NotionRichText {
  type: "rich_text";
  rich_text: NotionText[];
}

interface NotionRelation {
  id: string;
}

interface NotionSelect {
  name: string;
}

interface NotionMultiSelect {
  multi_select: { name: string }[];
}

interface NotionStatus {
  status: { name: string };
}

interface NotionDate {
  date: { start: string };
}

interface NotionPageProperties {
  Nome?: NotionTitle;
  Descrição?: NotionRichText;
  ["Descrição Longa"]?: NotionRichText;
  ["Tópicos Chave"]?: NotionRichText;
  Tags?: NotionMultiSelect;
  Status?: NotionStatus;
  Track?: { select: NotionSelect };
  ["Área Foco"]?: NotionMultiSelect;
  ["Tipo de Conteúdo"]?: { select: NotionSelect };
  ["Público-Alvo"]?: { select: NotionSelect };
  Palestrante?: { relation: NotionRelation[] };
  Date?: NotionDate;
  Imagem?: NotionRichText;
  ["Profissão"]?: NotionRichText;
  Empresa?: NotionRichText;
  Bio?: NotionRichText;
  linkedin?: { url?: string };
  Visible?: { checkbox?: boolean };
}

interface NotionPage {
  id: string;
  properties: NotionPageProperties;
  object: "page";
}

interface Speaker {
  id: string;
  nome: string;
  foto: string;
  profissão: string;
  entidade: string;
  bio: string;
  lkdn: string;
  visible: boolean;
}

/* ---------------- FUNÇÕES AUX ---------------- */

function getTitleText(title: NotionTitle | undefined): string {
  if (!title) return "";
  return title.title.map((t) => t.text.content).join("");
}

function getRichText(richText: NotionRichText | undefined): string {
  if (!richText) return "";
  return richText.rich_text.map((t) => t.text.content).join("");
}

function getRelationIds(relation: { relation: NotionRelation[] } | undefined): string[] {
  if (!relation) return [];
  return relation.relation.map((r) => r.id);
}

function isPageObject(obj: unknown): obj is NotionPage {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "object" in obj &&
    (obj as Record<string, unknown>).object === "page"
  );
}


/* ---------------- SPEAKERS ---------------- */

export async function getSpeakersMap(): Promise<Speaker[]> {
  const response = await notion.databases.query({
    database_id: SPEAKERS_DB_ID,
    filter: { property: "Visible", checkbox: { equals: true } },
  });

  const pages = response.results as NotionPage[];

  const palestrantes: Speaker[] = pages.map((page) => {
    const p = page.properties;

    return {
      id: page.id,
      nome: getTitleText(p.Nome),
      foto: p.Imagem?.rich_text?.[0]?.plain_text || "",
      profissão: p["Profissão"]?.rich_text?.[0]?.plain_text || "",
      entidade: p.Empresa?.rich_text?.[0]?.plain_text || "",
      bio: p.Bio?.rich_text?.[0]?.plain_text || "",
      lkdn: p.linkedin?.url || "",
      visible: p.Visible?.checkbox ?? false,
    };
  });

  return palestrantes;
}

/* ---------------- PROGRAMAÇÃO ---------------- */

export async function getProgramacao() {
  try {
    const speakersMap = await getSpeakersMap();

    const response = await notion.databases.query({
      database_id: DB_ID,
      filter: {
        or: [
          { property: "Status", status: { equals: "Aguardando Material" } },
          { property: "Status", status: { equals: "Pronto" } },
        ],
      },
      sorts: [{ property: "Date", direction: "ascending" }],
    });

    const pages = (response.results as NotionPage[]).filter(isPageObject);

    const items = pages.map((page) => {
      const p = page.properties;

      const speakerIds = getRelationIds(p.Palestrante);

      const speakersFound: (Speaker | undefined)[] = speakerIds.map((id) =>
        speakersMap.find((s) => s.id === id)
      );

      const speakers: Speaker[] = speakersFound.filter((s): s is Speaker => !!s);

      const start = p.Date?.date?.start ?? null;
      const dateObj = start ? new Date(start) : null;

      return {
        id: page.id,
        nome: getTitleText(p.Nome),
        date: start,
        dayKey: dateObj?.toISOString().split("T")[0] || null,
        dayLabel: dateObj
          ? dateObj.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })
          : null,
        time: dateObj
          ? dateObj.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null,
        tags: p.Tags?.multi_select?.map((t) => t.name) || [],
        speakers,
        speakerNames: speakers.map((s: Speaker) => s.nome) || "Surpresa!",
        publico: p["Público-Alvo"]?.select?.name || "",
        status: p.Status?.status?.name || "",
        track: p.Track?.select?.name || "",
        area: p["Área Foco"]?.multi_select?.map((t) => t.name) || [],
        tipoConteudo: p["Tipo de Conteúdo"]?.select?.name || "",
        topics: getRichText(p["Tópicos Chave"]),
        description: getRichText(p.Descrição),
        bigDescription: getRichText(p["Descrição Longa"]),
      };
    });

    return items;
  } catch (error) {
    console.error("ERRO AO BUSCAR PROGRAMAÇÃO:", error);
    return [];
  }
}
