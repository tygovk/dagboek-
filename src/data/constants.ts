import { JournalEntry, MoodMeta, MoodType } from '../types';

export const MOODS: Record<MoodType, MoodMeta> = {
  Vreugdevol: {
    type: 'Vreugdevol',
    label: 'Vreugdevol',
    emoji: '☀️',
    bgLight: 'bg-amber-100',
    textColor: 'text-amber-800',
    dotColor: 'bg-amber-500',
  },
  Kalm: {
    type: 'Kalm',
    label: 'Kalm',
    emoji: '🌿',
    bgLight: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    dotColor: 'bg-emerald-500',
  },
  Dankbaar: {
    type: 'Dankbaar',
    label: 'Dankbaar',
    emoji: '💖',
    bgLight: 'bg-rose-100',
    textColor: 'text-rose-800',
    dotColor: 'bg-rose-500',
  },
  Gefocust: {
    type: 'Gefocust',
    label: 'Gefocust',
    emoji: '💻',
    bgLight: 'bg-indigo-100',
    textColor: 'text-indigo-800',
    dotColor: 'bg-indigo-500',
  },
  Peinzend: {
    type: 'Peinzend',
    label: 'Peinzend',
    emoji: '🤔',
    bgLight: 'bg-sky-100',
    textColor: 'text-sky-800',
    dotColor: 'bg-sky-500',
  },
  Energiek: {
    type: 'Energiek',
    label: 'Energiek',
    emoji: '⚡',
    bgLight: 'bg-orange-100',
    textColor: 'text-orange-800',
    dotColor: 'bg-orange-500',
  },
  Gestrest: {
    type: 'Gestrest',
    label: 'Gestrest',
    emoji: '🌧️',
    bgLight: 'bg-slate-200',
    textColor: 'text-slate-700',
    dotColor: 'bg-slate-500',
  },
  Melancholisch: {
    type: 'Melancholisch',
    label: 'Melancholisch',
    emoji: '🌙',
    bgLight: 'bg-violet-100',
    textColor: 'text-violet-800',
    dotColor: 'bg-violet-500',
  },
};

export const INITIAL_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-1',
    title: 'Ochtend in het park',
    content:
      'Vroeg opgestaan en een lange wandeling gemaakt door het bosrijke stadspark. De dauw lag nog op het gras en de vogels zongen volop. Ik merkte hoe stil mijn hoofd werd na een drukke week. Een moment van pure dankbaarheid en frisse lucht.',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    createdAt: Date.now() - 86400000,
    mood: 'Vreugdevol',
    emoji: '☀️',
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
    ],
    aiInsight: 'Natuurwandelingen brengen je direct in een opgewekte, ontspannen gemoedstoestand.',
  },
  {
    id: 'entry-2',
    title: 'Architectuur Sessie & Brainstorm',
    content:
      'Vandaag samen met het team gezeten om de nieuwe software-architectuur neer te zetten. Complexe keuzes gemaakt over data-opslag, AI-workflows en modulaire componenten. Het voelde heerlijk om in diepe focus te werken en alles op zijn plek te zien vallen.',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    createdAt: Date.now() - 86400000 * 2,
    mood: 'Gefocust',
    emoji: '💻',
    photos: [],
    aiInsight: 'Geconcentreerde creativiteit en duidelijke doelen gaven je vandaag veel voldoening.',
  },
  {
    id: 'entry-3',
    title: 'Diner met familie',
    content:
      'Gezellig gegeten met familie. Verse pasta gekookt en urenlang nagepraat over herinneringen van vroeger. Het zijn juist deze ongeplande, warme avonden die me doen inzien wat echt belangrijk is in het leven.',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    createdAt: Date.now() - 86400000 * 3,
    mood: 'Dankbaar',
    emoji: '🍜',
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    ],
    aiInsight: 'Verbinding met dierbaren brengt diepe emotionele voldoening en warmte.',
  },
];

export const INITIAL_WEEKLY_INSIGHT = {
  summary:
    'Je lijkt deze week veel rust te vinden in de natuur en verbinding met dierbaren. Je stemming piekte na je wandelingen en diepe focussessies.',
  keyThemes: ['Rust & Natuur', 'Diepe Focus', 'Waardevolle Relaties'],
  moodTrend: 'Overwegend vreugdevol en gebalanceerd',
  encouragement:
    'Houd dit evenwicht vast tussen gerichte creatie overdag en ontspannende natuurwandelingen.',
  updatedAt: new Date().toISOString(),
};
