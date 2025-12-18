export type SentenceToken =
  | { type: 'text'; value: string }
  | {
      type: 'blank'
      blankId: string
      answer: string
      hint?: string
    }

export type Question = {
  id: string
  title: string
  level?: 'A1' | 'A2' | 'B1' | 'B2'
  tokens: SentenceToken[]
  wordBank: string[]
}

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    title: 'Present simple (habit)',
    level: 'A1',
    tokens: [
      { type: 'text', value: 'I ' },
      { type: 'blank', blankId: 'b1', answer: 'go', hint: 'verb' },
      { type: 'text', value: ' to school every day.' },
    ],
    wordBank: ['go', 'goes', 'went', 'walk'],
  },
  {
    id: 'q2',
    title: 'Past tense',
    level: 'A2',
    tokens: [
      { type: 'text', value: 'She ' },
      { type: 'blank', blankId: 'b1', answer: 'visited', hint: 'verb (past)' },
      { type: 'text', value: ' her grandma ' },
      { type: 'blank', blankId: 'b2', answer: 'yesterday', hint: 'time' },
      { type: 'text', value: '.' },
    ],
    wordBank: ['visit', 'visited', 'tomorrow', 'yesterday', 'quickly'],
  },
  {
    id: 'q3',
    title: 'Common collocation',
    level: 'A2',
    tokens: [
      { type: 'text', value: 'He ' },
      { type: 'blank', blankId: 'b1', answer: 'takes', hint: 'verb' },
      { type: 'text', value: ' a ' },
      { type: 'blank', blankId: 'b2', answer: 'shower', hint: 'noun' },
      { type: 'text', value: ' every morning.' },
    ],
    wordBank: ['take', 'takes', 'makes', 'shower', 'sleep'],
  },
]
