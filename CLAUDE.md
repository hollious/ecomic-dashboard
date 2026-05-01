# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a basic web project template for learning and experimentation with Claude Code. The project uses vanilla HTML, CSS, and JavaScript with no build tools or frameworks.

## Running the Project

**Start local server:**
```bash
cd ~/Downloads/"Claude Code Test"/Test
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser.

**Alternative with Node.js:**
```bash
npx serve
```

## Project Structure

- `index.html` - Main HTML entry point with Korean language set
- `styles.css` - All styling uses modern CSS with gradient backgrounds
- `script.js` - JavaScript functionality with DOMContentLoaded event handling

## Development Notes

- The project uses Korean as the primary language (lang="ko")
- No build process or package management - direct file editing
- All files are self-contained with no external dependencies
- Responsive design with mobile-first approach using viewport meta tag