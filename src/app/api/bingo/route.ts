import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
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

async function fetchMissionsFromNotion() {
    return await notion.databases.query({
      database_id: process.env.NOTION_MISSIONS_DATABASE_ID!,
      filter: { property: "Active", checkbox: { equals: true } },
    });
}

export async function GET() {
  try {

    const missionsRes = await getCachedData(
        "bingo_missions_raw", 
        fetchMissionsFromNotion, 
        600
    );

    const missions = missionsRes.results.filter(isPage).map((page) => {
        const p = page.properties;
        const codeValue = p.Code?.type === "rich_text" ? p.Code.rich_text[0]?.plain_text : "";
        return {
           id: page.id,
           text: p.Mission?.type === "title" ? p.Mission.title[0]?.plain_text : "Missão",
           type: p.Type?.type === "select" ? p.Type.select?.name : "fun",
           icon: p.Icon?.type === "rich_text" ? p.Icon.rich_text[0]?.plain_text : "Star",
           validationType: codeValue ? 'code' : 'check',
           correctCode: codeValue || null
        };
    });

    return NextResponse.json(missions, { headers: { ...corsHeaders, "Cache-Control": "s-maxage=600" } });

  } catch (err) {
    console.error("ERRO API BINGO MISSIONS:", err);
    return NextResponse.json({ error: "Erro ao buscar missões" }, { status: 500 });
  }
}