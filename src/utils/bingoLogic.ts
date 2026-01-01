import { UserData } from "@/contexts/UserContext";

export interface BingoMission {
  id: string;
  text: string;
  type: 'talk' | 'company' | 'networking' | 'fun' | 'secret';
  icon: string; 
  validationType: 'code' | 'check';
  correctCode?: string | null;
  position: number; 
  isLocked?: boolean;
  relatedTalk?: string;
  relatedSpeaker?: string;
}

export interface BingoPreset {
  id: string;
  text: string;
  type: 'company' | 'fun' | 'secret';
  icon: string;
  validationType: 'code' | 'check';
  correctCode?: string;
}

export function generateBingoCard(
  userData: UserData,
  agendaItems: any[], 
  presets: BingoPreset[] 
): BingoMission[] {
  
  const missionsPool: Omit<BingoMission, 'position'>[] = [];
  let uniqueIdCounter = Date.now(); 


  const myTalksWithQuestions = agendaItems.filter(item => 
    userData.agenda_favorites?.includes(item.id) &&
    item.presenters?.some((p: any) => p.type === 'person' && p.bingoOptions && p.bingoOptions.length > 0)
  );

  const selectedTalks = myTalksWithQuestions
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  selectedTalks.forEach(talk => {
    const speaker = talk.presenters.find((p: any) => p.bingoOptions && p.bingoOptions.length > 0);
    
    if (speaker) {
      const randomIndex = Math.floor(Math.random() * speaker.bingoOptions.length);
      const questionData = speaker.bingoOptions[randomIndex];

      missionsPool.push({
        id: `talk-${uniqueIdCounter++}`,
        type: 'talk',
        text: questionData.question, 
        icon: 'Mic2', 
        validationType: 'code',
        correctCode: questionData.code,
        relatedTalk: talk.nome,
        relatedSpeaker: speaker.name
      });
    }
  });


  
  const secretPreset = presets.find(p => p.type === 'secret');
  const otherPresets = presets.filter(p => p.type !== 'secret');
  const slotsNeeded = 8 - missionsPool.length;

  const selectedPresets = otherPresets
    .sort(() => 0.5 - Math.random())
    .slice(0, slotsNeeded);

  selectedPresets.forEach(preset => {
    missionsPool.push({
      id: preset.id || `preset-${uniqueIdCounter++}`,
      type: preset.type as any,
      text: preset.text,
      icon: preset.icon,
      validationType: preset.validationType,
      correctCode: preset.correctCode
    });
  });

  // ===========================================================================
  // 3. MONTAGEM DO GRID FINAL
  // ===========================================================================
  
  const peripheralIndices = [0, 1, 2, 3, 5, 6, 7, 8];
  const finalCard: BingoMission[] = [];
  const shuffledPool = missionsPool.sort(() => 0.5 - Math.random());

  shuffledPool.forEach((mission, index) => {
    if (index < peripheralIndices.length) {
      finalCard.push({
        ...mission,
        position: peripheralIndices[index]
      });
    }
  });

  // ===========================================================================
  // 4. ADICIONA O PRÊMIO (CENTRO - POSIÇÃO 4)
  // ===========================================================================
  if (secretPreset) {
    finalCard.push({
      id: secretPreset.id || 'secret-mission',
      type: 'secret',
      text: secretPreset.text,
      icon: secretPreset.icon || 'Gift', 
      validationType: secretPreset.validationType,
      correctCode: secretPreset.correctCode,
      position: 4, 
      isLocked: true 
    });
  } else {
    finalCard.push({
      id: 'secret-mission-fallback',
      type: 'secret',
      text: "Resgate seu prêmio final!",
      icon: 'Gift',
      validationType: 'check',
      position: 4,
      isLocked: true
    });
  }

  return finalCard.sort((a, b) => a.position - b.position);
}