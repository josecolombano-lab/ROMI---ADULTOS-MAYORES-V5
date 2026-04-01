export enum ViewState {
  SPLASH = 'SPLASH',
  HOME = 'HOME',
  NEWS = 'NEWS',
  HEALTH = 'HEALTH',
  AGENDA = 'AGENDA',
  GAMES = 'GAMES',
  NOTES = 'NOTES',
  REGISTER = 'REGISTER',
  LOGIN = 'LOGIN',
  PREMIUM = 'PREMIUM'
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string; // Base64 data
  name: string;
}

export interface Note {
  id: string;
  content: string;
  date: string;
  authorEmail?: string;
  authorUid?: string;
  attachments?: Attachment[];
}

export interface AgendaEvent {
  date: string; // Format YYYY-MM-DD
  note: string;
}

export interface ExternalLink {
  title: string;
  url: string;
  description?: string;
}