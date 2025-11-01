// Shim for projects/libraries that still do `import React from 'react'`
// or call `React.useState`. It re-exports React and also provides
// a default export so those patterns keep working on React 19+.
const React = require('react');

// Re-export everything for named imports.
Object.assign(exports, React);

// Provide a default export for any default import consumers.
module.exports = React;
module.exports.default = React;
