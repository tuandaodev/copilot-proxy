# Copilot Proxy

A simple HTTP proxy that exposes your GitHub Copilot free quota as an OpenAI-compatible API.

## Features

- Proxies requests to `https://api.githubcopilot.com`
  - Support endpoint `/chat/completion`
- User-friendly admin UI:
  - Log in with GitHub and generate tokens
  - Add tokens manually
  - Manage multiple tokens with ease
  - View chat message and code completion usage statistics

## How to use
- Start the proxy server by `npx`
    ```bash
    npx copilot-proxy

    ```
- Browse `http://localhost:3000` to generate the token by following the instructions.
  - Or add your own token manually.
- Set a default token.
- Your OpenAI-compatible API base URL is `http://localhost:3000/api`
  - You can test it like this: (no need authorization header since you've set a default token!)
  ```
  curl --request POST \
  --url http://localhost:3000/api/chat/completions \
  --header 'content-type: application/json' \
  --data '{
  "messages": [
    {
      "role": "user",
      "content": "Hi"
    }
  ],
  "model": "gpt-4.1"}'
  ```
- (Optional) Use environment variable `PORT` for setting different port
## Requirements

- Node.js 22 or higher 
