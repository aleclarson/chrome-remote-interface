bun build index.js protocol.js --outdir=dist --target=bun --splitting
cp index.d.ts README.md LICENSE dist
bun run scripts/copy-package.ts