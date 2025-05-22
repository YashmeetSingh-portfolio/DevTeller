import * as vscode from 'vscode';
import { GoogleGenAI } from '@google/genai';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
// Your Gemini system prompt enforcing strict JSON output


const GEMINI_SYSTEM_PROMPT = `
You are a code explanation API that ONLY returns raw JSON output. Your responses must:

1. Be valid JSON parsable by JSON.parse()
2. Contain NO Markdown syntax (no \`\`\`json or \`\`\` wrappers)
3. Have NO additional text before or after the JSON
4. Follow EXACTLY this format:

[
  { 
      "line": 1, 
      "code": "function example() {",
      "explanation": "Brief explanation",
      "detailedText": "Detailed explanation" 
  }
]

BAD EXAMPLE (NEVER DO THIS):
\`\`\`json
[{"line": 1, ...}]
\`\`\`

GOOD EXAMPLE (ALWAYS DO THIS):
[{"line": 1, ...}]

The user will provide code. Analyze it line by line and return your explanation in the specified JSON format with NO WRAPPERS or EXTRA TEXT.
`;

// Initialize AI with API key from environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function activate(context) {
  let disposable = vscode.commands.registerCommand('DevTeller.explainCode', async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showErrorMessage("No code selected.");
      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText) {
      vscode.window.showErrorMessage("Please select some code to explain.");
      return;
    }

    let explanation = 'Unable to generate explanation.';
    try {
      // Send system + user prompt to Gemini
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          { text: GEMINI_SYSTEM_PROMPT },
          { text: selectedText }
        ],
      });

      const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Try parsing the JSON from Gemini response
      try {
        const parsedJson = JSON.parse(rawText);

        // Format the parsed JSON into a readable HTML string with line-by-line explanation
        explanation = parsedJson.map(item => 
          `<strong>Line ${item.line}:</strong> <code>${escapeHtml(item.code)}</code><br>
           <em>Explanation:</em> ${escapeHtml(item.explanation)}<br>
           <small>${escapeHtml(item.detailedText)}</small><br><br>`
        ).join("");
      } catch (jsonErr) {
        // If JSON parse fails, fallback to raw text
        explanation = "Failed to parse JSON response. Raw output:<br><pre>" + escapeHtml(rawText) + "</pre>";
      }

    } catch (err) {
      explanation = "Error: " + err.message;
    }

    // Create and show webview panel
    const panel = vscode.window.createWebviewPanel(
      'DevTellerExplanation',
      'Code Explanation',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
      }
    );

    // Path to CSS file on disk
    const cssPathOnDisk = vscode.Uri.file(
      path.join(context.extensionPath, 'media', 'style.css')
    );

    // Convert to vscode resource URI
    const cssUri = panel.webview.asWebviewUri(cssPathOnDisk);

    // Read HTML file from disk
    let htmlPath = path.join(context.extensionPath, 'media', 'webview.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Inject CSS URI into HTML
    htmlContent = htmlContent.replace('{{CSS_URI}}', cssUri.toString());

    // Set the webview's HTML content
    panel.webview.html = htmlContent;

    // Send the explanation message to webview after it loads
    panel.webview.postMessage({ text: explanation });
  });

  context.subscriptions.push(disposable);
}

// Escape HTML helper to prevent injection issues
function escapeHtml(unsafe) {
  return unsafe.replace(/[&<"'>]/g, function(m) {
    switch(m) {
      case '&': return "&amp;";
      case '<': return "&lt;";
      case '>': return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#039;";
      default: return m;
    }
  });
}

export function deactivate() {}