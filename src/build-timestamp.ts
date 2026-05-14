// This file helps trigger fresh deploys on Vercel
// Vercel checks the build output directory timestamp

export const LAST_BUILD = new Date().toISOString();
