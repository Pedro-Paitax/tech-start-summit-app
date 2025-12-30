require("dotenv").config();

const { Client } = require("@notionhq/client");
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const DB_ID = process.env.NOTION_PROGRAM_DB_KEY;
const SPEAKERS_DB_ID = process.env.NOTION_SPEAKERS_DB_KEY;

async function getSpeakersMap() {
  const response = await notion.databases.query({
    database_id: SPEAKERS_DB_ID,
    filter: { property: "Visible", checkbox: { equals: true } },
  });

  return response.results.map((page) => {
    const p = page.properties;
    return {
      id: page.id,
      nome: p.Nome?.title?.[0]?.plain_text || "",
      foto: p.Imagem?.rich_text?.[0]?.plain_text || "",
      profissão: p["Profissão"]?.rich_text?.[0]?.plain_text || "",
      entidade: p.Empresa?.rich_text?.[0]?.plain_text || "",
      bio: p.Bio?.rich_text?.[0]?.plain_text || "",
      lkdn: p.linkedin?.url || "",
      visible: p.Visible?.checkbox ?? false,
    };
  });
}

async function syncToFirebase() {
  const speakersMap = await getSpeakersMap();

  const response = await notion.databases.query({
    database_id: DB_ID,
    filter: {
      or: [
        { property: "Status", status: { equals: "Aguardando Material" } },
        { property: "Status", status: { equals: "Pronto" } },
        { property: "Status", status: { equals: "Published" } },
      ],
    },
    sorts: [{ property: "Date", direction: "ascending" }],
  });

  const items = response.results.map((page) => {
    const p = page.properties;

    const speakerIds =
      p["Palestrante"]?.relation?.map((r) => r.id) || [];

    const speakers = speakerIds
      .map((id) => speakersMap.find((s) => s.id === id))
      .filter(Boolean);

    return {
      id: page.id,
      nome: p.Nome?.title?.[0]?.plain_text || "",
      date: p["Date"]?.date?.start || null,
      dayKey: p["Date"]?.date?.start
        ? new Date(p["Date"].date.start).toISOString().split("T")[0]
        : null,
      dayLabel: p["Date"]?.date?.start
        ? new Date(p["Date"].date.start).toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
          })
        : null,
      time: p["Date"]?.date?.start
        ? new Date(p["Date"].date.start).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      tags: p["Tags"]?.multi_select?.map((t) => t.name) || [],
      speakers,
      speakerNames: speakers.map((s) => s.nome),
      publico: p["Público-Alvo"]?.select?.name || "",
      status: p["Status"]?.status?.name || "",
      track: p["Track"]?.select?.name || "",
      area: p["Área Foco"]?.multi_select?.map((t) => t.name) || [],
      tipoConteudo: p["Tipo de Conteúdo"]?.select?.name || "",
      topics: p["Tópicos Chave"]?.rich_text?.[0]?.plain_text || "",
      description: p["Descrição"]?.rich_text?.[0]?.plain_text || "",
      bigDescription:
        p["Descrição Longa"]?.rich_text?.[0]?.plain_text || "",
      _timestamp: p["Date"]?.date?.start
        ? new Date(p["Date"].date.start).getTime()
        : 0,
    };
  });

  if (!items.length) return;

  const batch = db.batch();

  items.forEach((item) => {
    const ref = db.collection("agenda").doc(item.id);
    batch.set(ref, item, { merge: true });
  });

  await batch.commit();
}

syncToFirebase();
