# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web application project aimed at helping students improve their writing skills. The codebase is currently empty - this is a new project that needs to be built from scratch.

## Architecture

This is a static website project deployed to GitHub Pages. It uses HTML5 video for embedding training videos.

## Project Structure

```
/
├── index.html          # Main webpage
└── resource/
    └── videos/         # Video files (place .mp4 files here)
```

## GitHub Pages Deployment

Push to GitHub, then go to Repository Settings → Pages, select "main" branch as source.

## Common Commands

- **Local preview**: Open `index.html` directly in browser, or use `python -m http.server 8000`

## Development Guidelines

- This is a greenfield project - the structure should be established based on the chosen web framework's best practices
- Focus on creating an interactive learning experience for students to practice writing
