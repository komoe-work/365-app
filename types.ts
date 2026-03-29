
export interface AudioGuide {
  id: number;
  titleEn: string;
  titleMy: string;
  isCompleted: boolean;
  audioUrl?: string;
  fileId?: string;
  downloadUrl?: string;
  fileName?: string;
  shareLink?: string;
  date?: string;
  explanation?: string;
}

export interface MorningState {
  date: string;
  audioGuides: AudioGuide[];
}
