
import { AudioGuide } from '../types';

export const AUDIO_LINKS: Record<number, string> = {
  // Hardcoded fallbacks for the first 5 days
  1: "1g4hPMTpBQwRFi8_hBOGwKP-RRwrzi2V8",
  2: "1DhMZwrsySWsOxUNd1wGJka7ioVSFsjFv",
  3: "1ebxI0V0-E06HtolmyU5mmw2TuXYgEHVi",
  4: "1W7hGLOw2sTE_peSRCGRYg2XiIZ_OEvxu",
  5: "1oVaoll-xKEPzaOjyZxKn7aqXxCMZQk55",
};

export const getDriveUrl = (id: string) => `https://drive.google.com/file/d/${id}/view`;
export const getDownloadUrl = (id: string) => `https://drive.google.com/uc?export=download&id=${id}`;

export const meditationItems: AudioGuide[] = Array.from({ length: 365 }, (_, i) => {
  const day = i + 1;
  const fileId = AUDIO_LINKS[day];
  return {
    id: day,
    titleEn: `Day ${day}`,
    titleMy: `နေ့ရက် (${day})`,
    isCompleted: false,
    fileId,
    audioUrl: fileId ? getDriveUrl(fileId) : undefined,
    downloadUrl: fileId ? getDownloadUrl(fileId) : undefined
  };
});
