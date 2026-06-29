# Neural Pulse

**Real-time LLM observability dashboard for OpenAI models.**

Neural Pulse is a terminal dashboard that streams OpenAI chat completions and visualizes inference in real time. Track token usage, latency, throughput, and cost from live API data — in a polished, htop-style interface.

<!-- Replace with a screenshot or asciinema recording before publishing -->
<!-- ![Neural Pulse dashboard](docs/screenshot.png) -->

> The pipeline animation is an **illustrative visualization** inspired by transformer inference — it reflects streaming activity, not real model activations.

## Features

- **Live streaming** — OpenAI chat completions with usage reconciliation
- **Real metrics** — input/output tokens, TPS, latency, and cost
- **Event log** — timestamped request timeline (connect, first token, completion)
- **Fixed dashboard** — alt-screen UI with incremental ANSI updates (no scroll)
- **Interactive sessions** — run multiple prompts without restarting
- **Compact layout** — automatic fallback for terminals under 140 columns
- **Cross-platform** — macOS Terminal, iTerm2, Warp, Windows Terminal, Linux

## Installation

**Global install**

```bash
npm install -g neural-pulse
```

**One-off run**

```bash
npx neural-pulse
```

**From source**

```bash
git clone https://github.com/suraj/neural-pulse.git
cd neural-pulse
npm install
cp .env.example .env
# Add your OPENAI_API_KEY to .env
```

## Configuration

Create a `.env` file in your working directory (or export variables in your shell):

```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
```

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | **Required.** Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` | Default model |
| `NEURAL_PULSE_FPS` | `30` | Dashboard render loop FPS |
| `NEURAL_PULSE_ANIM_MS` | `100` | Pipeline pulse animation (ms) |
| `NEURAL_PULSE_MAX_TOKENS` | *(unset)* | Optional completion token cap |
| `NEURAL_PULSE_ASCII` | `0` | Set to `1` to force ASCII spinner |

`.env` is loaded automatically from the current directory.

## Usage

```bash
# Interactive — enter prompts in the dashboard
neural-pulse

# Run immediately with a prompt
neural-pulse "Explain transformers"

# Specify a model
neural-pulse --model gpt-4o-mini "Write a haiku about GPUs"

# Help and version
neural-pulse --help
neural-pulse --version
```

### Keyboard shortcuts

| Key | Action |
|-----|--------|
| `P` / `Ctrl+P` | New prompt |
| `Q` / `Ctrl+C` | Exit |

## Supported models

Neural Pulse works with any OpenAI chat model your API key can access. Built-in cost estimates are provided for:

| Model | Input / 1M tokens | Output / 1M tokens |
|-------|-------------------|---------------------|
| `gpt-4o-mini` | $0.15 | $0.60 |
| `gpt-4o` | $2.50 | $10.00 |
| `gpt-4.1` | $2.00 | $8.00 |
| `gpt-4.1-mini` | $0.40 | $1.60 |
| `gpt-4-turbo` | $10.00 | $30.00 |
| `gpt-3.5-turbo` | $0.50 | $1.50 |

Prefix matching handles versioned model names (e.g. `gpt-4o-mini-2024-07-18`).

Add or update pricing in [`src/metrics/pricing.js`](src/metrics/pricing.js).

## Cost calculation

```
cost = (inputTokens × inputPrice + outputTokens × outputPrice) / 1,000,000
```

Token counts are estimated live during streaming and reconciled from `usage` data when the API provides it.

## Requirements

- Node.js **18+**
- OpenAI API key
- Interactive terminal (minimum **76 columns**)

## Publishing

Maintainers can publish to npm:

```bash
npm login
npm publish
```

### Version bumps

```bash
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0
```

The dashboard reads the version from `package.json` automatically.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please read our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) © Suraj S
