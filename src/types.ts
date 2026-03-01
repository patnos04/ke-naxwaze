export interface Question {
  level: number;
  question: string;
  options: string[];
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export type GameStatus = 'idle' | 'loading' | 'playing' | 'won' | 'lost';

export type Language = 'ku' | 'tr' | 'en';

export interface GameState {
  currentLevel: number;
  score: number;
  status: GameStatus;
  currentQuestion: Question | null;
  usedQuestionIds: number[];
  usedQuestionTexts: string[];
  language: Language;
  lifelines: {
    fiftyFifty: boolean;
    phoneFriend: boolean;
    askAudience: boolean;
  };
}

export const RANK_TITLES: Record<Language, string[]> = {
  ku: [
    "Nûhat",
    "Şagirt",
    "Xwendekar",
    "Lêkolîner",
    "Nivîskar",
    "Rewşenbîr",
    "Mamoste",
    "Zanyar",
    "Fîlozof",
    "Pîr",
    "Mîr",
    "Şah",
    "Serkeftiyê Mezin"
  ],
  tr: [
    "Başlangıç",
    "Çırak",
    "Öğrenci",
    "Araştırmacı",
    "Yazar",
    "Entelektüel",
    "Öğretmen",
    "Bilim İnsanı",
    "Filozof",
    "Bilge",
    "Üstat",
    "Şah",
    "Büyük Kazanan"
  ],
  en: [
    "Beginner",
    "Apprentice",
    "Student",
    "Researcher",
    "Writer",
    "Intellectual",
    "Teacher",
    "Scientist",
    "Philosopher",
    "Sage",
    "Master",
    "King",
    "Grand Winner"
  ]
};
