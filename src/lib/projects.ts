import { load } from 'js-yaml';
import raw from '../data/projects.yaml?raw';

export interface Project {
  slug: string;
  name: string;
  featured: boolean;
  year?: number;
  github?: string;
  demo?: string;
  tags: string[];
  tagline: { en: string; fr: string };
}

export const projects: Project[] = (load(raw) as { projects: Project[] }).projects;

export function projectTagline(p: Project, lang: 'en' | 'fr'): string {
  return p.tagline[lang];
}
