import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// NOTA: Removi o Font.register externo para evitar erros de 404 e travamentos.
// O PDF usará Helvetica (padrão), que é segura e rápida.

export type AgendaItemPDF = {
  id: string;
  nome: string;
  time: string;
  dayKey: string | null;
  dayLabel: string;
  track?: string;
  description?: string;
  bigDescription?: string;
  speakerNames?: string[];
  tipoConteudo?: string;
  topics?: string; 
};

interface AgendaPDFProps {
  items: AgendaItemPDF[];
  userName: string;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica', // Fonte padrão do PDF (Zero erro de carregamento)
    fontSize: 11,
    padding: 30,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
  },
  userName: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold', // Helvetica suporta bold nativamente
    color: '#1e293b',
  },
  daySection: {
    marginTop: 15,
    marginBottom: 10,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  activity: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
  },
  timeCol: {
    width: '15%',
    paddingRight: 10,
  },
  contentCol: {
    width: '85%',
  },
  timeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  metaText: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  speaker: {
    fontSize: 10,
    color: '#475569',
    // REMOVIDO: fontStyle: 'italic' (Causava o crash)
    marginBottom: 4,
  },
  description: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 1.4,
    marginBottom: 6,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  topic: {
    fontSize: 8,
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  }
});

export const AgendaPDF: React.FC<AgendaPDFProps> = ({ items, userName }) => {
  const grouped: Record<string, AgendaItemPDF[]> = {};
  items.forEach(item => {
    if (!grouped[item.dayLabel]) grouped[item.dayLabel] = [];
    grouped[item.dayLabel].push(item);
  });

  const days = Object.keys(grouped);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.userName}>Agenda Personalizada de {userName}</Text>
          <Text style={styles.title}>Minha Jornada TechSummit</Text>
        </View>

        {days.map((dayLabel) => (
          <View key={dayLabel} style={styles.daySection} wrap={false}>
            <Text style={styles.dayLabel}>{dayLabel}</Text>

            {grouped[dayLabel]
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((item) => (
                <View key={item.id} style={styles.activity} wrap={false}>
                  
                  <View style={styles.timeCol}>
                    <Text style={styles.timeText}>{item.time}</Text>
                  </View>

                  <View style={styles.contentCol}>
                    <Text style={styles.metaText}>
                      {item.track} • {item.tipoConteudo}
                    </Text>
                    
                    <Text style={styles.activityTitle}>{item.nome}</Text>
                    
                    {item.speakerNames && item.speakerNames.length > 0 && (
                      <Text style={styles.speaker}>
                        com {item.speakerNames.join(', ')}
                      </Text>
                    )}

                    {item.description && (
                      <Text style={styles.description}>
                        {item.bigDescription || item.description}
                      </Text>
                    )}

                    {item.topics && (
                      <View style={styles.topicsContainer}>
                        {item.topics.split(';').map((topic, idx) => (
                          topic.trim() ? (
                            <Text key={idx} style={styles.topic}>{topic.trim()}</Text>
                          ) : null
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              ))}
          </View>
        ))}

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `Gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')} • Página ${pageNumber} de ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};