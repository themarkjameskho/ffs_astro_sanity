import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { dashboardTool } from '@sanity/dashboard';
import deskStructure from './deskStructure';
import { schemaTypes } from './schemaTypes';
import MissingContentWidget from './widgets/MissingContentWidget';
import { StudioTheme } from './components/StudioTheme';

// Env files are loaded by sanity.cli.js (Node context). Keep this config browser-safe.

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? process.env.SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error('Missing SANITY project configuration. Add SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET.');
}

export default defineConfig({
  name: 'bedbugbegonenow-studio',
  title: 'Bed Bug Be Gone Now',
  subtitle: 'Bed Bug Be Gone Now',
  projectId,
  dataset,
  icon: () => '🐞',
  studio: {
    components: [
      {
        name: 'theme',
        component: StudioTheme
      }
    ]
  },
  plugins: [
    dashboardTool({
      widgets: [
        {
          name: 'content-health',
          component: MissingContentWidget,
          layout: { width: 'full' }
        }
      ]
    }),
    structureTool({ structure: deskStructure }),
    visionTool()
  ],
  schema: {
    types: schemaTypes
  }
});
