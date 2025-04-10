# GitHub Copilot Proxy

A simple HTTP proxy that forwards requests to the GitHub Copilot API and appends custom headers.

## Features

- Proxies requests to `https://api.githubcopilot.com`
- Appends custom headers:
  - `Editor-Version`
  - `Copilot-Integration-Id`
- Maintains original request headers and body

## Installation

```bash
npm install
```

## Usage

Start the proxy server:

```bash
npm start
```

The proxy server runs on port 3000 by default. You can point your application to `http://localhost:3000` instead of `https://api.githubcopilot.com`.

## Configuration

Edit the `main.js` file to modify:

- `PORT`: The local port to run the proxy on (default: 3000)
- `TARGET_HOST`: The target API host (default: api.githubcopilot.com)
- `CUSTOM_HEADERS`: The headers to append to each request

## Requirements

- Node.js 14.0.0 or higher 