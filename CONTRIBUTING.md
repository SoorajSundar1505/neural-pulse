# Contributing to Neural Pulse

Thank you for your interest in contributing!

## Getting started

1. Fork the repository and clone it locally.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and add your `OPENAI_API_KEY`.
4. Run locally: `npm start` or `node bin/neural-pulse.js`

## Development

```bash
npm start                          # interactive dashboard
npm start -- "Your prompt here"    # run with a prompt
npm run lint                       # ESLint
```

## Pull requests

1. Create a focused branch from `main`.
2. Keep changes small and well-scoped.
3. Do not redesign the dashboard UI unless the issue explicitly requires it.
4. Run `npm run lint` before submitting.
5. Update `CHANGELOG.md` under **Unreleased** for user-visible changes.

## Reporting issues

Include:

- OS and terminal emulator (e.g. macOS + iTerm2)
- Node.js version (`node -v`)
- Terminal size (`echo $COLUMNS x $LINES`)
- Steps to reproduce
- Expected vs actual behavior

## Code style

- ES modules (`import` / `export`)
- Match existing file structure and naming
- Prefer small, focused modules over large files

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
