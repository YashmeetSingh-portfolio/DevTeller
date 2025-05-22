# 🚀 DevTeller - AI Code Explainer for VS Code

DevTeller is a powerful Visual Studio Code extension that uses **Google Gemini AI** to explain code **line by line** in natural language. Just select code, right-click or use the command, and instantly understand what your code is doing.

![Demo](media/demo.gif)

---

## ✨ Features

- ✅ Line-by-line explanations of selected code
- ✅ AI-generated **brief** and **detailed** insights
- ✅ Clean webview UI with styling
- ✅ Activate from the toolbar or right-click menu
- ✅ Supports all programming languages

---

## 🧠 Powered by Google Gemini

This extension uses the **Gemini 2.0 Flash model** from the Google Generative AI API for fast and accurate code analysis.

---

## 📦 Installation

### Marketplace Installation (Recommended)
1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X`)
3. Search for "DevTeller"
4. Click Install

### Manual Installation from GitHub
1. Download the latest `.vsix` file from [Releases](https://github.com/yourusername/DevTeller/releases)
2. In VS Code:
   - Open Command Palette (`Ctrl+Shift+P`)
   - Run `Extensions: Install from VSIX...`
   - Select the downloaded `.vsix` file
3. Reload VS Code when prompted

### Post-Installation
1. Set your Gemini API key:
   - Open Command Palette (`Ctrl+Shift+P`)
   - Run `DevTeller: Set API Key`
   - Enter your [Google AI Studio API key](https://aistudio.google.com/)

---

## 🛠️ How to Use

### 1. **Select Code**
Highlight any block of code in your editor.

### 2. **Activate**
Right-click and choose:
> 💡 Explain Code with DevTeller

or run the command:
```bash
Ctrl + Shift + P → DevTeller: Explain Code