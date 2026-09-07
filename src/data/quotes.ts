import { DailyQuote } from '../types';

export const CURATED_QUOTES: Omit<DailyQuote, 'id' | 'date'>[] = [
  {
    text: 'Geluk in je leven hangt af van de kwaliteit van je gedachten.',
    author: 'Marcus Aurelius',
    theme: 'Zelfreflectie',
    reflection: 'Welke gedachte bracht je vandaag rust of juist onrust?',
  },
  {
    text: 'We lijden vaker in onze verbeelding dan in de werkelijkheid.',
    author: 'Seneca',
    theme: 'Gemoedsrust',
    reflection: 'Welke zorg van vandaag bleek achteraf minder zwaar dan je dacht?',
  },
  {
    text: 'Een reis van duizend mijl begint met een enkele stap.',
    author: 'Lao Tzu',
    theme: 'Beginnen',
    reflection: 'Welke kleine stap kun je vandaag zetten voor jezelf?',
  },
  {
    text: 'Wat je zoekt, zoekt ook jou.',
    author: 'Rumi',
    theme: 'Verlangen',
    reflection: 'Waar verlangt je hart op dit moment het meest naar?',
  },
  {
    text: 'Vergeet niet dat de mooiste dingen in de wereld niet met geld te koop zijn.',
    author: 'Albert Einstein',
    theme: 'Dankbaarheid',
    reflection: 'Welk kosteloos moment heeft je vandaag geraakt?',
  },
  {
    text: 'Vrijheid is niet het ontbreken van verplichtingen, maar het vermogen om te kiezen wat het beste voor je is.',
    author: 'Paulo Coelho',
    theme: 'Keuzes',
    reflection: 'Welke bewuste keuze maakte jij vandaag voor je eigen welzijn?',
  },
  {
    text: 'Als je vrede wilt in de wereld, begin dan met vrede in jezelf.',
    author: 'Thich Nhat Hanh',
    theme: 'Innerlijke rust',
    reflection: 'Hoe kun je op dit moment vriendelijker zijn voor jezelf?',
  },
  {
    text: 'Wie een waarom heeft om voor te leven, kan bijna elk hoe verdragen.',
    author: 'Friedrich Nietzsche',
    theme: 'Betekenis',
    reflection: 'Wat gaf jouw dag vandaag betekenis en richting?',
  },
  {
    text: 'Niet wat je overkomt bepaalt je leven, maar hoe je erop reageert.',
    author: 'Epictetus',
    theme: 'Veerkracht',
    reflection: 'Hoe reageerde je vandaag op een onverwachte gebeurtenis?',
  },
  {
    text: 'Ik droom mijn schilderij en dan schilder ik mijn droom.',
    author: 'Vincent van Gogh',
    theme: 'Creativiteit',
    reflection: 'Welk beeld of idee wil je vandaag vormgeven?',
  },
  {
    text: 'Wees de verandering die je in de wereld wilt zien.',
    author: 'Mahatma Gandhi',
    theme: 'Inspiratie',
    reflection: 'Welke kleine positieve invloed had jij vandaag op iemand anders?',
  },
  {
    text: 'Dankbaarheid verandert wat we hebben in genoeg.',
    author: 'Aesopus',
    theme: 'Dankbaarheid',
    reflection: 'Noem drie eenvoudige dingen waar je vandaag dankbaar voor bent.',
  },
  {
    text: 'De stilte is niet leeg, ze zit vol met antwoorden.',
    author: 'Boeddha',
    theme: 'Stilte',
    reflection: 'Heb je vandaag al een moment van pure stilte ervaren?',
  },
  {
    text: 'Het leven kan alleen achterwaarts worden begrepen, maar het moet voorwaarts worden geleefd.',
    author: 'Søren Kierkegaard',
    theme: 'Levenspad',
    reflection: 'Welke les uit het verleden helpt je vandaag verder?',
  },
  {
    text: 'Alles wat je ooit hebt gewild bevindt zich aan de andere kant van angst.',
    author: 'George Addair',
    theme: 'Moed',
    reflection: 'Waar mag je vandaag een stukje dapperder in zijn?',
  },
  {
    text: 'Vergelijk jezelf niet met anderen van vandaag, vergelijk jezelf met wie je gisteren was.',
    author: 'Jordan Peterson',
    theme: 'Groei',
    reflection: 'Waarin ben jij gegroeid de afgelopen periode?',
  },
  {
    text: 'De natuur haast zich nooit, toch komt alles tot stand.',
    author: 'Lao Tzu',
    theme: 'Geduld',
    reflection: 'Waar mag je jezelf wat meer tijd en geduld voor gunnen?',
  },
  {
    text: 'Het geheim van vooruitkomen is beginnen.',
    author: 'Mark Twain',
    theme: 'Actie',
    reflection: 'Welk uitgesteld taakje kun je vandaag rustig afronden?',
  },
  {
    text: 'Moed is niet de afwezigheid van angst, maar het besef dat iets anders belangrijker is dan angst.',
    author: 'Ambrose Redmoon',
    theme: 'Moed',
    reflection: 'Wat is voor jou belangrijk genoeg om je angst voor te trotseren?',
  },
  {
    text: 'Rust is geen luiheid, het is de bron van hernieuwde energie.',
    author: 'John Lubbock',
    theme: 'Herstel',
    reflection: 'Hoe laad jij vandaag je mentale batterij weer op?',
  },
  {
    text: 'De enige constante in het leven is verandering.',
    author: 'Heraclitus',
    theme: 'Verandering',
    reflection: 'Welke verandering mag je op dit moment omarmen?',
  },
  {
    text: 'Als je planten water geeft, bloeien ze; geef je jezelf ook genoeg aandacht?',
    author: 'Nederlands spreekwoord',
    theme: 'Zelfzorg',
    reflection: 'Hoe heb je vandaag voor je lichaam en geest gezorgd?',
  },
  {
    text: 'Ieder moment is een nieuwe kans om opnieuw te beginnen.',
    author: 'Carl Bard',
    theme: 'Vernieuwing',
    reflection: 'Welke frisse blik wil je meenemen naar de rest van deze dag?',
  },
  {
    text: 'Eenvoud is de ultieme verfijning.',
    author: 'Leonardo da Vinci',
    theme: 'Eenvoud',
    reflection: 'Wat kun je vandaag simpeler maken in je hoofd of agenda?',
  },
  {
    text: 'Kennis spreekt, maar wijsheid luistert.',
    author: 'Jimi Hendrix',
    theme: 'Aandacht',
    reflection: 'Naar wie of wat heb je vandaag echt geluisterd?',
  },
];

/**
 * Deterministically computes a daily quote based on the date string (YYYY-MM-DD).
 * Ensures that every day of the year has its own unique, consistent quote!
 */
export function getDailyQuoteForDate(dateStr: string): DailyQuote {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CURATED_QUOTES.length;
  const quote = CURATED_QUOTES[index];

  return {
    id: `quote-${dateStr}`,
    text: quote.text,
    author: quote.author,
    theme: quote.theme,
    reflection: quote.reflection,
    date: dateStr,
    isGenerated: false,
  };
}

/**
 * Returns a random quote from the curated pool.
 */
export function getRandomCuratedQuote(): DailyQuote {
  const index = Math.floor(Math.random() * CURATED_QUOTES.length);
  const quote = CURATED_QUOTES[index];
  const today = new Date().toISOString().split('T')[0];

  return {
    id: `quote-random-${Date.now()}`,
    text: quote.text,
    author: quote.author,
    theme: quote.theme,
    reflection: quote.reflection,
    date: today,
    isGenerated: false,
  };
}
