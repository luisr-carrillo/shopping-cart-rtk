const fs = require('fs');

// Leer los resultados de Jest
const results = JSON.parse(fs.readFileSync('results.json', 'utf8'));

// Crear contenido en formato Markdown
const markdown = `
## Test Results
Test Suites: ${results.numFailedTestSuites} failed, ${results.numPassedTestSuites} passed, ${results.numTotalTestSuites} total
Tests: ${results.numFailedTests} failed, ${results.numPassedTests} passed, ${results.numTotalTests} total
All tests success: ${results.success}
`;

// Escribir el contenido en un archivo Markdown
fs.writeFileSync('TEST_RESULTS.md', markdown);
