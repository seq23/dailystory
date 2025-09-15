/**
 * TypeScript interfaces for Visual Detail tracking
 * Extracted from VisualDetailTracker for type-only usage
 */

export interface VisualDetail {
  id: string;
  user_id: string;
  session_id: string;
  character_name: string;
  image_url: string;
  visual_elements: {
    backgroundColor: string;
    lighting: string;
    composition: string;
    setting: string;
    mood: string;
    style: string;
  };
  generated_at: string;
  page_number: number;
}

export interface AppearanceConflict {
  type: 'hair_color' | 'clothing' | 'setting' | 'style';
  previous_value: string;
  new_value: string;
  confidence: number;
  resolved: boolean;
}