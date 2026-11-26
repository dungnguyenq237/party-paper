import { buildPublicArtifact } from './scripts/public-artifact.mjs';

// Compatibility with the current Render command: npm test builds the SEO
// stage, then Render copies the maker and allowlisted assets into dist.
buildPublicArtifact({ seoOnly: true });
