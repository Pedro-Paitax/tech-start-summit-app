import express from "express";
import { getProgramacao } from "./notion.js";
import cors from "cors";
import "dotenv/config";
import { generateAgendaPDF } from "./pdf.js";

const app = express();
const PORT = process.env.PORT || 3333;
app.use(cors());

app.get("/agenda", async (req, res) => {
  try {
    const agenda = await getProgramacao();
    res.json(agenda);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar agenda" });
  }
});


app.post("/api/generate-agenda-pdf", async (req, res) => {
  const { items, userName } = req.body;

  const pdf = await generateAgendaPDF(items, userName);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=minha-agenda.pdf"
  );

  res.send(pdf);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});