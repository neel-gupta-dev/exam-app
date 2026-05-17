import { cp, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const adminRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(adminRoot, '..', '..');
const source = path.resolve(adminRoot, 'dist');
const target = path.resolve(repoRoot, 'server', 'admin-static');
const sourceAssets = path.join(source, 'assets');
const targetAssets = path.join(target, 'assets');

const copyIfPossible = async (from, to, options = {}) => {
  try {
    await cp(from, to, options);
  } catch (error) {
    if (error?.code === 'EPERM') {
      console.warn(`[admin-static] Skipped locked file: ${to}`);
      return;
    }
    throw error;
  }
};

if (!source.startsWith(adminRoot + path.sep)) {
  throw new Error(`Refusing to copy from unexpected source: ${source}`);
}

if (!target.startsWith(path.resolve(repoRoot, 'server') + path.sep)) {
  throw new Error(`Refusing to replace unexpected target: ${target}`);
}

await mkdir(target, { recursive: true });
await mkdir(targetAssets, { recursive: true });
await copyIfPossible(path.join(source, 'index.html'), path.join(target, 'index.html'), { force: true });

const assets = await readdir(sourceAssets, { withFileTypes: true });
for (const asset of assets) {
  if (!asset.isFile()) continue;

  const sourceAsset = path.join(sourceAssets, asset.name);
  const targetAsset = path.join(targetAssets, asset.name);
  const extension = path.extname(asset.name).toLowerCase();

  await copyIfPossible(sourceAsset, targetAsset, {
    force: extension === '.js' || extension === '.css',
    errorOnExist: false,
  });
}
