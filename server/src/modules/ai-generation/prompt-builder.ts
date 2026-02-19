// ─── Prompt Builder ─────────────────────────────────────────
//
// Pure function — no I/O, no side effects, no hardcoded furniture types.
// Everything is driven by database data (category name/description + option promptHints).
// Adding a new furniture category (table, chair, bed) requires ZERO code changes.

// ─── Input / Output Interfaces ──────────────────────────────

/** A single selected option with its group context and admin-configured prompt hint */
export interface PromptOptionItem {
  /** Display name of the option group (e.g., "Color", "Material", "Leg Style") */
  groupName: string;
  /** Machine-readable slug of the option group */
  groupSlug: string;
  /** Display label of the selected value (e.g., "Navy Blue") — fallback when promptHint is null */
  valueLabel: string;
  /** Admin-configured AI prompt fragment (e.g., "deep navy blue fabric with rich, saturated tone") */
  promptHint: string | null;
}

/** Everything the prompt builder needs — fully data-driven, no hardcoded furniture references */
export interface PromptBuilderInput {
  /** Furniture category name from DB (e.g., "Sofa", "Dining Table", "Armchair") */
  categoryName: string;
  /** Category description from DB — gives the AI context about the furniture type */
  categoryDescription: string | null;
  /** All selected options, pre-sorted by group.sortOrder */
  options: PromptOptionItem[];
  /** Optional user free-text (max 500 chars, Zod-validated at API layer) */
  freeText: string | null;
}

/** Separated output for optimal Gemini API usage */
export interface PromptBuilderOutput {
  /** AI role + strict rules — passed to Gemini config.systemInstruction */
  systemInstruction: string;
  /** The image generation request — passed to Gemini contents */
  generationPrompt: string;
  /** Combined prompt for logging/storage in AiGeneration.prompt */
  fullPromptForLog: string;
}

// ─── Constants ──────────────────────────────────────────────

const SYSTEM_INSTRUCTION = `You are an expert product photographer and 3D rendering specialist for high-end furniture.
You create photorealistic product images for premium furniture catalogs and e-commerce.

STRICT RULES:
- Generate EXACTLY ONE piece of furniture per image
- The furniture must be the sole focal point, centered in the frame
- Use a clean, minimal environment (no other furniture or clutter)
- Maintain photorealistic quality — indistinguishable from a real product photo
- Accurately represent ALL specified materials, colors, and design details
- Do not add text, watermarks, labels, or logos
- Do not generate people, pets, or living beings`;

const PHOTOGRAPHY_DIRECTION = `=== PHOTOGRAPHY DIRECTION ===
- Camera angle: 3/4 front perspective (showing front and one side)
- Lighting: Professional studio lighting, soft shadows, key light upper-left, fill light right, subtle rim light
- Background: Clean neutral gradient (light warm gray to white) with soft shadow beneath
- Composition: Product centered, occupying 70-80% of the frame
- Render style: Photorealistic product photography, sharp focus, subtle depth of field on background
- Quality: High-resolution commercial product shot, e-commerce catalog quality`;

// ─── Reimagine Constants ────────────────────────────────────

const REIMAGINE_SYSTEM_INSTRUCTION = `You are an expert interior designer and photorealistic image compositor.
You receive a photograph of a real room and specifications for a piece of furniture.
Your task is to generate a new image showing the specified furniture naturally placed in the room.

STRICT RULES:
- The output MUST look like an authentic photograph — indistinguishable from a real photo
- Match the room's existing lighting, perspective, shadows, and color temperature exactly
- The placed furniture must have correct proportions relative to the room
- Maintain the room's existing walls, floor, ceiling, and architectural features
- Do not add text, watermarks, labels, or logos
- Do not add people, pets, or living beings
- Keep all existing elements of the room intact unless placement instructions say otherwise
- The furniture piece must cast appropriate shadows consistent with the room's light sources`;

const REIMAGINE_COMPOSITING_DIRECTION = `=== COMPOSITING DIRECTION ===
- Perspective: Match the exact camera angle and lens distortion of the original photograph
- Lighting: Analyze the room's existing light sources and replicate their effect on the furniture
- Shadows: Generate floor shadows and ambient occlusion that match the room's lighting setup
- Materials: Render furniture materials with accurate reflections and texture detail
- Color grading: Match the color temperature and exposure of the original photograph
- Integration: The furniture should look like it was always part of the room
- Quality: High-resolution, photorealistic composite — indistinguishable from a real photograph`;

/** Additional input for reimagine mode */
export interface ReimaginePromptInput extends PromptBuilderInput {
  placementInstructions: string | null;
}

// ─── Sanitization ───────────────────────────────────────────

/**
 * Sanitizes user free text to prevent prompt injection.
 * Defense-in-depth alongside Zod max(500) validation and the system instruction's STRICT RULES.
 */
export function sanitizeFreeText(text: string): string {
  return text
    // Strip attempts to override system instructions
    .replace(/(IGNORE|OVERRIDE|DISREGARD|FORGET)\s+(ALL|PREVIOUS|ABOVE|SYSTEM)/gi, '')
    // Strip section delimiters that could break prompt structure
    .replace(/={3,}/g, '-')
    // Strip markdown/formatting that could confuse the model
    .replace(/```[\s\S]*?```/g, '')
    .replace(/#{1,6}\s/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
    // Hard limit (defense-in-depth)
    .slice(0, 500);
}

// ─── Builder ────────────────────────────────────────────────

/**
 * Formats a single option line for the specification section.
 * Prefers admin-curated promptHint over the generic label.
 */
function formatOption(option: PromptOptionItem): string {
  const description = option.promptHint?.trim() || option.valueLabel;
  return `- ${option.groupName}: ${description}`;
}

/**
 * Builds a structured prompt for Gemini image generation.
 *
 * Completely data-driven — the category name, description, and every option's
 * prompt hint come from the database. Adding a "Dining Table" or "Armchair"
 * category requires zero code changes: the admin just configures the category
 * description and option value prompt hints via the catalog API.
 */
export function buildReimaginePrompt(input: ReimaginePromptInput): PromptBuilderOutput {
  const sections: string[] = [];

  // Section 1: Room placement request
  sections.push('=== ROOM FURNITURE PLACEMENT REQUEST ===');
  sections.push('');
  sections.push('I am providing a photograph of a room. Place the following furniture into this room:');
  sections.push('');
  sections.push(`FURNITURE TYPE: ${input.categoryName}`);

  if (input.categoryDescription?.trim()) {
    sections.push(`CONTEXT: ${input.categoryDescription.trim()}`);
  }

  // Section 2: Furniture specifications from selected options
  if (input.options.length > 0) {
    sections.push('');
    sections.push('=== FURNITURE SPECIFICATIONS ===');
    for (const option of input.options) {
      sections.push(formatOption(option));
    }
  }

  // Section 3: Placement instructions (sanitized)
  if (input.placementInstructions?.trim()) {
    const sanitized = sanitizeFreeText(input.placementInstructions);
    if (sanitized.length > 0) {
      sections.push('');
      sections.push('=== PLACEMENT INSTRUCTIONS ===');
      sections.push(sanitized);
    }
  }

  // Section 4: User free text (optional, sanitized)
  if (input.freeText?.trim()) {
    const sanitized = sanitizeFreeText(input.freeText);
    if (sanitized.length > 0) {
      sections.push('');
      sections.push('=== ADDITIONAL DETAILS ===');
      sections.push(sanitized);
    }
  }

  // Section 5: Compositing direction
  sections.push('');
  sections.push(REIMAGINE_COMPOSITING_DIRECTION);

  const generationPrompt = sections.join('\n');
  const fullPromptForLog = `[SYSTEM]\n${REIMAGINE_SYSTEM_INSTRUCTION}\n\n[PROMPT]\n${generationPrompt}`;

  return {
    systemInstruction: REIMAGINE_SYSTEM_INSTRUCTION,
    generationPrompt,
    fullPromptForLog,
  };
}

export function buildPrompt(input: PromptBuilderInput): PromptBuilderOutput {
  const sections: string[] = [];

  // Section 1: Product identification
  sections.push('=== PRODUCT IMAGE REQUEST ===');
  sections.push('');
  sections.push(`FURNITURE TYPE: ${input.categoryName}`);

  if (input.categoryDescription?.trim()) {
    sections.push(`CONTEXT: ${input.categoryDescription.trim()}`);
  }

  // Section 2: Design specifications from selected options
  if (input.options.length > 0) {
    sections.push('');
    sections.push('=== DESIGN SPECIFICATIONS ===');
    for (const option of input.options) {
      sections.push(formatOption(option));
    }
  }

  // Section 3: User free text (optional, sanitized)
  if (input.freeText?.trim()) {
    const sanitized = sanitizeFreeText(input.freeText);
    if (sanitized.length > 0) {
      sections.push('');
      sections.push('=== ADDITIONAL DETAILS ===');
      sections.push(sanitized);
    }
  }

  // Section 4: Photography direction (always last, consistent across all categories)
  sections.push('');
  sections.push(PHOTOGRAPHY_DIRECTION);

  const generationPrompt = sections.join('\n');
  const fullPromptForLog = `[SYSTEM]\n${SYSTEM_INSTRUCTION}\n\n[PROMPT]\n${generationPrompt}`;

  return {
    systemInstruction: SYSTEM_INSTRUCTION,
    generationPrompt,
    fullPromptForLog,
  };
}
