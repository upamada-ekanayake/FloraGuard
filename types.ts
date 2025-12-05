export interface Diagnosis {
  status: string;
  diseaseName: string;
  confidence: string;
  whatISaw: string;
  howToFixItOrganic: string;
  prevention: string;
  detailedCareTips: string;
}

export interface HistoryItem {
  id: number;
  image: string;
  diagnosis: Diagnosis | null;
  rawResponse: string | null;
  timestamp: string;
}