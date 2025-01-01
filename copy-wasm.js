const fs = require('fs');
    const path = require('path');

    const wasmPath = path.join(require.resolve('sql.js'), '..', 'sql-wasm.wasm');
    const destPath = path.join(__dirname, 'public', 'sql-wasm.wasm');

    fs.copyFileSync(wasmPath, destPath);
