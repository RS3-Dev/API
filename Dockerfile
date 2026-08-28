FROM debian:bookworm-slim

ARG BUN_VERSION=1.3.0

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl unzip \
    && curl -fsSL \
      "https://github.com/oven-sh/bun/releases/download/bun-v${BUN_VERSION}/bun-linux-x64-baseline.zip" \
      -o /tmp/bun.zip \
    && unzip /tmp/bun.zip -d /tmp \
    && mv /tmp/bun-linux-x64-baseline/bun /usr/local/bin/bun \
    && chmod +x /usr/local/bin/bun \
    && rm -rf /tmp/bun.zip /tmp/bun-linux-x64-baseline /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["bun", "run", "start"]
