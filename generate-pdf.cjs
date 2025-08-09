const fs = require('fs');
const path = require('path');

// Simple HTML to PDF converter using Node.js
function convertMarkdownToHtml(markdown) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>TenantX Production Readiness Analysis</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
        }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 40px; border-left: 4px solid #3498db; padding-left: 20px; }
        h3 { color: #2980b9; margin-top: 30px; }
        h4 { color: #27ae60; }
        .status-critical { color: #e74c3c; font-weight: bold; }
        .status-warning { color: #f39c12; font-weight: bold; }
        .status-success { color: #27ae60; font-weight: bold; }
        code { 
            background: #f8f9fa; 
            padding: 2px 4px; 
            border-radius: 3px; 
            font-size: 0.9em;
        }
        pre {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #3498db;
            overflow-x: auto;
        }
        .checklist { list-style-type: none; padding-left: 0; }
        .checklist li { margin: 10px 0; }
        .checklist li:before { content: "☐ "; font-size: 1.2em; color: #3498db; }
        .warning-box {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .critical-box {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .cost-breakdown {
            background: #e8f5e8;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        @media print {
            body { margin: 0; padding: 20px; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
${markdown
  .replace(/\*\*Current Status\*\*: ⚠️ \*\*NOT PRODUCTION READY\*\*/g, '<div class="critical-box"><strong>Current Status</strong>: <span class="status-critical">⚠️ NOT PRODUCTION READY</span></div>')
  .replace(/\*\*Status\*\*: ❌ \*\*CRITICAL\*\*/g, '<span class="status-critical">Status: ❌ CRITICAL</span>')
  .replace(/\*\*Status\*\*: ⚠️ \*\*PARTIAL\*\*/g, '<span class="status-warning">Status: ⚠️ PARTIAL</span>')
  .replace(/\*\*Status\*\*: ❌ \*\*MISSING\*\*/g, '<span class="status-critical">Status: ❌ MISSING</span>')
  .replace(/\*\*Status\*\*: ❌ \*\*INSUFFICIENT\*\*/g, '<span class="status-critical">Status: ❌ INSUFFICIENT</span>')
  .replace(/\*\*Status\*\*: ⚠️ \*\*INEFFICIENT\*\*/g, '<span class="status-warning">Status: ⚠️ INEFFICIENT</span>')
  .replace(/# (.*)/g, '<h1>$1</h1>')
  .replace(/## (.*)/g, '<h2>$1</h2>')
  .replace(/### (.*)/g, '<h3>$1</h3>')
  .replace(/#### (.*)/g, '<h4>$1</h4>')
  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  .replace(/\*(.*?)\*/g, '<em>$1</em>')
  .replace(/`(.*?)`/g, '<code>$1</code>')
  .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
  .replace(/- \[ \] (.*)/g, '<li class="checklist">☐ $1</li>')
  .replace(/- \[x\] (.*)/g, '<li class="checklist">✅ $1</li>')
  .replace(/---/g, '<hr>')
  .replace(/\n\n/g, '</p><p>')
  .replace(/\n/g, '<br>')
}
</body>
</html>
  `;
}

// Read the markdown file
const markdownPath = path.join(__dirname, 'PRODUCTION_READINESS_ANALYSIS.md');
const markdownContent = fs.readFileSync(markdownPath, 'utf8');

// Convert to HTML
const htmlContent = convertMarkdownToHtml(markdownContent);

// Write HTML file
const htmlPath = path.join(__dirname, 'PRODUCTION_READINESS_ANALYSIS.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log('✅ HTML file generated successfully!');
console.log('📁 Location:', htmlPath);
console.log('');
console.log('📋 To convert to PDF:');
console.log('1. Open the HTML file in Chrome/Edge');
console.log('2. Press Ctrl+P (Print)');
console.log('3. Choose "Save as PDF" as destination');
console.log('4. Set margins to "Minimum" for best layout');
console.log('5. Save as: TenantX_Production_Readiness_Analysis.pdf');
