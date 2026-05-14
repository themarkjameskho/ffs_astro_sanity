# Design Inputs

Store every designer/client asset that informs global styles or UI foundations in this folder. Accepted formats include Markdown, PDF, DOCX, images, or Figma exports.

## Workflow
1. Place the original file here (e.g., `2025-11-04-global-styles.pdf`).
2. Convert non-Markdown formats to Markdown for easier diffing. Recommended commands:
   - PDF → Markdown: `pandoc "input.pdf" -f pdf -t gfm -o "design-inputs/input.md"`
   - DOCX → Markdown: `pandoc "input.docx" -t gfm -o "design-inputs/input.md"`
   - Figma text export → Markdown: copy into `input.md`.
3. Reference the converted file when filling out `global-styles-review.md` and `global-styles-implementation-plan.md`.
4. Keep the original source file alongside the Markdown version for traceability.

## Naming Convention
`YYYY-MM-DD-context.ext` (e.g., `2025-11-04-global-styles.pdf`, `2025-11-04-global-styles.md`).

