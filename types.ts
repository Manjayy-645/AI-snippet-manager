
export interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  updatedAt: number;
}

export interface AIExplanation {
  explanation: string;
  complexity?: string;
  suggestions?: string[];
}
