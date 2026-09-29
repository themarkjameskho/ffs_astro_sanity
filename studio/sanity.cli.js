const { defineCliConfig } = require('sanity/cli');
const { config: loadEnv } = require('dotenv');
const path = require('path');

loadEnv({ path: path.resolve(__dirname, '../.env') });
loadEnv({ path: path.resolve(__dirname, '.env') });

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? process.env.SANITY_DATASET;

if (!projectId || !dataset || /\{\{.*\}\}/.test(projectId) || /\{\{.*\}\}/.test(dataset)) {
  throw new Error('Missing SANITY project configuration. Ensure SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET are set.');
}

const cliConfig = {
  api: {
    projectId,
    dataset
  }
};

if (process.env.SANITY_STUDIO_HOST && !/\{\{.*\}\}/.test(process.env.SANITY_STUDIO_HOST)) {
  cliConfig.studioHost = process.env.SANITY_STUDIO_HOST;
}

module.exports = defineCliConfig(cliConfig);
