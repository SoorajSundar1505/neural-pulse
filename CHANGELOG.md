# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-29

### Added

- Real-time terminal dashboard for OpenAI streaming chat completions
- Live metrics: input/output tokens, TPS, latency, and cost
- Timestamped event log for request lifecycle
- Interactive multi-prompt sessions (`P` / `Ctrl+P`)
- Compact layout for terminals narrower than 140 columns
- CLI flags: `--help`, `--version`, `--model`
- Automatic `.env` loading
- Unicode spinner with ASCII fallback (`NEURAL_PULSE_ASCII=1`)
- Graceful error handling for API, network, and rate-limit failures

[1.0.0]: https://github.com/SoorajSundar1505/neural-pulse/releases/tag/v1.0.0
