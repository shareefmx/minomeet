import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { storageService } from '../services/storageService.js';
import { MOMTemplate } from '../types/index.js';

export const templatesRouter = Router();

// GET /api/templates
templatesRouter.get('/', (req: Request, res: Response) => {
  try {
    const templates = storageService.getTemplates();
    return res.json({ success: true, templates });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve templates', message: err.message });
  }
});

// GET /api/templates/:id
templatesRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const template = storageService.getTemplateById(id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    return res.json({ success: true, template });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve template', message: err.message });
  }
});

// POST /api/templates
templatesRouter.post('/', (req: Request, res: Response) => {
  try {
    const { name, category, description, sections, promptInstructions, isDefault } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    const newTemplate: MOMTemplate = {
      id: 'template-custom-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      category: category ? category.trim() : 'Custom Templates',
      description: description ? description.trim() : 'Custom Minutes of Meeting report template.',
      sections: Array.isArray(sections) && sections.length > 0
        ? sections
        : ['Executive Summary', 'Key Decisions', 'Action Items', 'Discussion Points', 'Next Steps'],
      promptInstructions: promptInstructions ? promptInstructions.trim() : 'Extract structured MOM summary based on user workflow.',
      isDefault: Boolean(isDefault),
      isSystem: false
    };

    const created = storageService.createTemplate(newTemplate);
    return res.status(201).json({ success: true, template: created });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create template', message: err.message });
  }
});

// PUT /api/templates/:id
templatesRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, category, description, sections, promptInstructions, isDefault } = req.body;

    const updates: Partial<MOMTemplate> = {};
    if (name !== undefined) updates.name = name.trim();
    if (category !== undefined) updates.category = category.trim();
    if (description !== undefined) updates.description = description.trim();
    if (sections !== undefined && Array.isArray(sections)) updates.sections = sections;
    if (promptInstructions !== undefined) updates.promptInstructions = promptInstructions.trim();
    if (isDefault !== undefined) updates.isDefault = Boolean(isDefault);

    const updated = storageService.updateTemplate(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Template not found' });
    }

    return res.json({ success: true, template: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update template', message: err.message });
  }
});

// DELETE /api/templates/:id
templatesRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = storageService.deleteTemplate(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Template not found' });
    }
    return res.json({ success: true, message: 'Template deleted successfully', id });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete template', message: err.message });
  }
});

// POST /api/templates/:id/default
templatesRouter.post('/:id/default', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const defaultTemplate = storageService.setDefaultTemplate(id);
    if (!defaultTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }
    return res.json({ success: true, template: defaultTemplate });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to set default template', message: err.message });
  }
});
