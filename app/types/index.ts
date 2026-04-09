// TypeScript interfaces for TGI BRAIN

export interface Entity {
  id: string
  name: string
  slug: string
  color: string
  created_at: string
}

export type NoteCategory = 'strategic' | 'technical' | 'marketing' | 'financial' | 'operations'
export type NoteStatus = 'raw_idea' | 'active_pipeline' | 'shelved'

export interface Note {
  id: string
  title: string
  content: string
  category: NoteCategory
  status: NoteStatus
  source: string | null
  user_id: string
  created_at: string
  updated_at: string
  entities?: Entity[]
  entity_ids?: string[]
}

export interface NoteEntity {
  note_id: string
  entity_id: string
}

export interface SynergyLink {
  source: string
  target: string
  count: number
}

export interface GraphNode {
  id: string
  name: string
  slug: string
  color: string
  noteCount: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

export interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  count: number
}

export const ENTITY_COLORS: Record<string, string> = {
  tgi: '#6366f1',
  enterbiner: '#f43f5e',
  sbs: '#0ea5e9',
  'mbink-farm': '#22c55e',
  tos: '#f59e0b',
  'drc-trans': '#a855f7',
}

export const CATEGORY_COLORS: Record<NoteCategory, string> = {
  strategic: '#818cf8',
  technical: '#38bdf8',
  marketing: '#fb923c',
  financial: '#4ade80',
  operations: '#e879f9',
}

export const CATEGORY_LABELS: Record<NoteCategory, string> = {
  strategic: 'Strategic',
  technical: 'Technical',
  marketing: 'Marketing',
  financial: 'Financial',
  operations: 'Operations',
}

export const STATUS_COLORS: Record<NoteStatus, string> = {
  raw_idea: '#94a3b8',
  active_pipeline: '#22d3ee',
  shelved: '#78716c',
}

export const STATUS_LABELS: Record<NoteStatus, string> = {
  raw_idea: 'Raw Idea',
  active_pipeline: 'Active Pipeline',
  shelved: 'Shelved',
}

export const CATEGORIES: NoteCategory[] = ['strategic', 'technical', 'marketing', 'financial', 'operations']
export const STATUSES: NoteStatus[] = ['raw_idea', 'active_pipeline', 'shelved']
