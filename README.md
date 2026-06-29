# Neural Pulse

**Real-time LLM observability dashboard for OpenAI models.**

Neural Pulse is a terminal dashboard for monitoring OpenAI responses in real time. Track token usage, latency, throughput (TPS), API cost, and live streaming output in a polished, htop-style interface.

## Demo

<video src="NP-GitHub-Demo.mp4" controls width="100%"></video>

[Download demo video](./NP-GitHub-Demo.mp4)

> The pipeline is an illustrative visualization inspired by transformer inference. It represents the request lifecycle and streaming activity, not the model's internal activations.

---

## Quick Start

```bash
export OPENAI_API_KEY=sk-your-key

npx neural-pulse "Explain artificial intelligence"
```

---

## Features

- Live streaming OpenAI responses
- Real-time token usage, TPS, latency, and API cost
- Timestamped event log
- Fixed dashboard with no terminal scrolling
- Interactive prompt sessions
- Compact layout for smaller terminals
- Cross-platform support (macOS, Linux, Windows Terminal, Warp, iTerm2)

---

## Installation

### Run without installing

```bash
npx neural-pulse
```

### Install globally

```bash
npm install -g neural-pulse
```

### Run from source

```bash
git clone https://github.com/SoorajSundar1505/neural-pulse.git
cd neural-pulse
npm install
cp .env.example .env
# Add your OPENAI_API_KEY
npm start
```

---

## Authentication

Neural Pulse uses **your own OpenAI API key**.

Requests are sent directly to the OpenAI API. Your usage, billing, and rate limits remain on your own OpenAI account.

---

## Configuration

Either export your API key:

```bash
export OPENAI_API_KEY=sk-your-key
```

or create a `.env` file:

```env
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o-mini
```

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | Required OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` | Default model |
| `NEURAL_PULSE_FPS` | `30` | Dashboard refresh rate |
| `NEURAL_PULSE_ANIM_MS` | `100` | Pipeline animation speed |
| `NEURAL_PULSE_MAX_TOKENS` | *(unset)* | Optional completion token limit |
| `NEURAL_PULSE_ASCII` | `0` | Force ASCII mode |

`.env` is automatically loaded from the current working directory.

---

## Usage

```bash
# Interactive mode
neural-pulse

# Run with a prompt
neural-pulse "Explain transformers"

# Choose a model
neural-pulse --model gpt-4o-mini "Write a haiku about GPUs"

# Help
neural-pulse --help

# Version
neural-pulse --version
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `P` / `Ctrl+P` | New prompt |
| `Q` / `Ctrl+C` | Exit |

---

## Supported Models

Neural Pulse works with any OpenAI model your API key can access.

| Model | Input / 1M | Output / 1M |
|-------|------------|-------------|
| gpt-4o-mini | $0.15 | $0.60 |
| gpt-4o | $2.50 | $10.00 |
| gpt-4.1 | $2.00 | $8.00 |
| gpt-4.1-mini | $0.40 | $1.60 |
| gpt-4-turbo | $10.00 | $30.00 |
| gpt-3.5-turbo | $0.50 | $1.50 |

Versioned model names are automatically matched (for example `gpt-4o-mini-2024-07-18`).

---

## Cost Calculation

```
cost = (inputTokens × inputPrice + outputTokens × outputPrice) / 1,000,000
```

During streaming, token counts and cost are estimated in real time. When the OpenAI API returns usage information, Neural Pulse reconciles the estimates with the final reported token counts.

---

## Requirements

- Node.js 18+
- OpenAI API key
- Interactive terminal (minimum 76 columns)

---

## Why Neural Pulse?

Neural Pulse helps developers observe OpenAI requests in real time by tracking:

- Token usage
- Tokens per second (TPS)
- Latency
- API cost
- Streaming output
- Request lifecycle

It's designed for developers building, debugging, and demonstrating LLM applications.

---

## Contributing

Contributions are welcome.

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

---

## License

MIT © Suraj S