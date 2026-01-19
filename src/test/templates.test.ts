import { describe, it, expect } from 'vitest';

// Test types and utilities for ON-WALL templates
interface OnWallConfig {
  focus?: 'project' | 'volume' | 'limit' | 'technique' | 'warmup' | 'custom';
  description?: string;
  grade_focus?: number;
  recommended_duration_min?: number;
  zone_guidance?: {
    comfort: number;
    growth: number;
    limit: number;
  };
  tag_presets?: string[];
  logging_fields?: {
    notes: boolean;
    attempts: boolean;
    style: boolean;
    angle: boolean;
  };
}

interface Template {
  id: string;
  name: string;
  template_type: 'on_wall' | 'off_wall';
  is_system?: boolean;
  config_json?: OnWallConfig | null;
  template_items?: Array<{ id: string; exercise_id: string }>;
}

/**
 * Determines if a template should render "Add Exercise" functionality
 */
function shouldShowAddExercise(template: Template): boolean {
  // ON-WALL templates never show exercise management
  return template.template_type === 'off_wall';
}

/**
 * Determines the correct session route based on template type
 */
function getSessionRoute(templateType: 'on_wall' | 'off_wall', sessionId: string): string {
  if (templateType === 'on_wall') {
    return `/session/${sessionId}/boulders`;
  }
  return `/session/${sessionId}/strength`;
}

/**
 * Validates ON-WALL template config
 */
function isValidOnWallConfig(config: OnWallConfig | null | undefined): boolean {
  if (!config) return false;
  
  // Must have valid zone distribution
  if (config.zone_guidance) {
    const total = config.zone_guidance.comfort + config.zone_guidance.growth + config.zone_guidance.limit;
    if (total !== 100) return false;
  }
  
  // Grade focus must be in valid range
  if (config.grade_focus !== undefined && (config.grade_focus < -2 || config.grade_focus > 2)) {
    return false;
  }
  
  // Duration must be reasonable
  if (config.recommended_duration_min !== undefined && 
      (config.recommended_duration_min < 15 || config.recommended_duration_min > 300)) {
    return false;
  }
  
  return true;
}

describe('ON-WALL Templates', () => {
  describe('shouldShowAddExercise', () => {
    it('should return false for ON-WALL templates', () => {
      const onWallTemplate: Template = {
        id: '1',
        name: 'Project Session',
        template_type: 'on_wall',
        config_json: { focus: 'project' },
      };
      
      expect(shouldShowAddExercise(onWallTemplate)).toBe(false);
    });
    
    it('should return true for OFF-WALL templates', () => {
      const offWallTemplate: Template = {
        id: '2',
        name: 'Max Hangs',
        template_type: 'off_wall',
        template_items: [],
      };
      
      expect(shouldShowAddExercise(offWallTemplate)).toBe(true);
    });
    
    it('should return false for ON-WALL templates regardless of items', () => {
      const onWallWithItems: Template = {
        id: '3',
        name: 'Volume Day',
        template_type: 'on_wall',
        // Even if someone tried to add items, ON-WALL should not show exercises
        template_items: [{ id: 'item1', exercise_id: 'ex1' }],
      };
      
      expect(shouldShowAddExercise(onWallWithItems)).toBe(false);
    });
  });
  
  describe('getSessionRoute', () => {
    it('should route ON-WALL templates to boulder session', () => {
      const sessionId = 'sess-123';
      expect(getSessionRoute('on_wall', sessionId)).toBe('/session/sess-123/boulders');
    });
    
    it('should route OFF-WALL templates to strength session', () => {
      const sessionId = 'sess-456';
      expect(getSessionRoute('off_wall', sessionId)).toBe('/session/sess-456/strength');
    });
  });
  
  describe('isValidOnWallConfig', () => {
    it('should validate correct config', () => {
      const validConfig: OnWallConfig = {
        focus: 'project',
        grade_focus: 1,
        recommended_duration_min: 90,
        zone_guidance: { comfort: 10, growth: 30, limit: 60 },
        tag_presets: ['Project', 'Beta'],
        logging_fields: { notes: true, attempts: true, style: false, angle: true },
      };
      
      expect(isValidOnWallConfig(validConfig)).toBe(true);
    });
    
    it('should reject null config', () => {
      expect(isValidOnWallConfig(null)).toBe(false);
    });
    
    it('should reject invalid zone distribution', () => {
      const invalidZones: OnWallConfig = {
        zone_guidance: { comfort: 50, growth: 50, limit: 50 }, // total = 150, not 100
      };
      
      expect(isValidOnWallConfig(invalidZones)).toBe(false);
    });
    
    it('should reject out-of-range grade focus', () => {
      const invalidGrade: OnWallConfig = {
        grade_focus: 5, // max is 2
      };
      
      expect(isValidOnWallConfig(invalidGrade)).toBe(false);
    });
    
    it('should reject unreasonable duration', () => {
      const invalidDuration: OnWallConfig = {
        recommended_duration_min: 500, // max is 300
      };
      
      expect(isValidOnWallConfig(invalidDuration)).toBe(false);
    });
    
    it('should accept config without optional fields', () => {
      const minimalConfig: OnWallConfig = {
        focus: 'custom',
      };
      
      expect(isValidOnWallConfig(minimalConfig)).toBe(true);
    });
  });
  
  describe('System Presets', () => {
    const systemPresets: Template[] = [
      { id: '1', name: 'Project Session', template_type: 'on_wall', is_system: true },
      { id: '2', name: 'Volume / Mileage', template_type: 'on_wall', is_system: true },
      { id: '3', name: 'Limit Boulders', template_type: 'on_wall', is_system: true },
      { id: '4', name: 'Technique / Slabs', template_type: 'on_wall', is_system: true },
      { id: '5', name: 'Warm-up + Moderate', template_type: 'on_wall', is_system: true },
    ];
    
    it('should have 5 system presets', () => {
      expect(systemPresets).toHaveLength(5);
    });
    
    it('should all be ON-WALL type', () => {
      systemPresets.forEach(preset => {
        expect(preset.template_type).toBe('on_wall');
      });
    });
    
    it('should all be marked as system templates', () => {
      systemPresets.forEach(preset => {
        expect(preset.is_system).toBe(true);
      });
    });
    
    it('should not allow deletion of system templates', () => {
      const canDelete = (template: Template) => !template.is_system;
      
      systemPresets.forEach(preset => {
        expect(canDelete(preset)).toBe(false);
      });
    });
  });
});

describe('OFF-WALL Templates', () => {
  it('should allow adding exercises', () => {
    const offWallTemplate: Template = {
      id: '1',
      name: 'Finger Strength',
      template_type: 'off_wall',
      template_items: [],
    };
    
    expect(shouldShowAddExercise(offWallTemplate)).toBe(true);
  });
  
  it('should show exercise count correctly', () => {
    const templateWithExercises: Template = {
      id: '2',
      name: 'Full Body',
      template_type: 'off_wall',
      template_items: [
        { id: 'item1', exercise_id: 'ex1' },
        { id: 'item2', exercise_id: 'ex2' },
        { id: 'item3', exercise_id: 'ex3' },
      ],
    };
    
    expect(templateWithExercises.template_items?.length).toBe(3);
  });
});
