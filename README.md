# Copilot Proxy

A simple HTTP proxy that exposes your GitHub Copilot free quota as an OpenAI-compatible API.

<img src="https://raw.githubusercontent.com/hankchiutw/copilot-proxy/main/screenshot.png" width="600">


## Why?
- You have a lot of free quota on GitHub Copilot, you want to use it like OpenAI-compatible APIs.
- You want the computing power of GitHub Copilot beyond VS Code.
- You want to use modern models like gpt-4.1 free.
- You have multiple GitHub accounts and the free quota is just wasted.
- Host LLM locally and leave the computing remotely.

## Features

- Proxies requests to `https://api.githubcopilot.com`
  - Support endpoints: `/chat/completions`, `/models`
- User-friendly admin UI:
  - Log in with GitHub and generate tokens
  - Add tokens manually
  - Manage multiple tokens with ease
  - View chat message and code completion usage statistics
- Supports Langfuse for LLM observability

## How to use
- Start the proxy server
  - Option 1: Use Docker
    ```bash
    docker run -p 3000:3000 ghcr.io/hankchiutw/copilot-proxy:latest
    ```
  - Option 2: Use `pnpx`(recommended) or `npx`
    ```bash
    pnpx copilot-proxy
    ```
- Browse `http://localhost:3000` to generate the token by following the instructions.
  - Or add your own token manually.
- Set a default token.
- Your OpenAI-compatible API base URL is `http://localhost:3000/api`
  - You can test it like this: (no need authorization header since you've set a default token!)
  ```
  curl --request POST --url http://localhost:3000/api/chat/completions --header 'content-type: application/json' \
  --data '{
      "model": "gpt-4",
      "messages": [{"role": "user", "content": "Hi"}]
  }'
  ```
  - You still can set a token in the request header `authorization: Bearer <token>` and it will override the default token.
- (Optional) Use environment variable `PORT` for setting different port other than `3000`.

## Available environment variables
  - `PORT`: Port number to listen on (default: `3000`)
  - `LOG_LEVEL`: Log level (default: `info`)
  - `STORAGE_DIR`: Directory to store tokens (default: `.storage`)
    - Be sure to backup this directory if you want to keep your tokens.
    - Note: even if you delete the storage folder, the token is still functional from GitHub Copilot. (That is how Github Copilot works at the moment.)
  - **Basic Authentication** (protects `/admin` and `/api` routes):
    - `BASIC_AUTH_ENABLED`: Enable/disable basic auth (default: `true`)
    - `BASIC_AUTH_USERNAME`: Username for basic auth (default: `admin`)
    - `BASIC_AUTH_PASSWORD`: Password for basic auth (default: `password`)
    - **⚠️ Security Warning**: Change the default credentials in production!
  - Langfuse is supported, see official [documentation](https://langfuse.com/docs/get-started) for more details.
      - `LANGFUSE_SECRET_KEY`: Langfuse secret key
      - `LANGFUSE_PUBLIC_KEY`: Langfuse public key
      - `LANGFUSE_BASEURL`: Langfuse base URL (default: `https://cloud.langfuse.com`)

## Advanced usage
- Dummy token `_` to make copilot-proxy use the default token.
    - In most cases, the default token just works without 'Authorization' header. But if your LLM client requires a non-empty API key, you can use the special dummy token `_` to make copilot-proxy use the default token.
- Tips for using docker:
  - Mount the storage folder from host to persist the tokens and use .env file to set environment variables
    ```bash
    docker run -p 3000:3000 -v /path/to/storage:/app/.storage -v /path/to/.env:/app/.env ghcr.io/hankchiutw/copilot-proxy:latest
    ```

## Use cases
- Use with [LLM](https://llm.datasette.io/en/stable/other-models.html#openai-compatible-models) CLI locally.
- Chat with GitHub Copilot by [Open WebUI](https://docs.openwebui.com/getting-started/).
## Requirements

- Node.js 22 or higher 

## References
- https://www.npmjs.com/package/@github/copilot-language-server
- https://github.com/B00TK1D/copilot-api
- https://github.com/ericc-ch/copilot-api
- https://hub.docker.com/r/mouxan/copilot

> Licensed under the [MIT License](./LICENSE).
