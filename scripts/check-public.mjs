import { assertLegacyAssetBoundary, verifyPublicArtifact } from './public-artifact.mjs';

assertLegacyAssetBoundary();
verifyPublicArtifact();
console.log('[check:public] Exact public allowlist and source bytes verified.');
