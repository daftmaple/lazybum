# Lazybum

A simple self-bot which switches games without typing `!game SUPERLONGNAMEFORAGAME` in chat. Requires Nightbot running in the channel.

This bot is dedicated for the laziest streamer in the world. FeelsWeirdMan 👉 beastyZF

## Requirements

- NodeJS at least ES2015/ES6 compatible. [Read compatibility list here](https://node.green/#ES2015).
- Yarn or npm.

## Init

1. Copy `config.json.example` to `config.json`
2. Create your app in Twitch developer dashboard
3. Get client id and client secret. [I've made a simple express app for this](https://github.com/daftmaple/twitch-oauth-token). Store it in `config.json` and prefill it in these fields:

```json
{
  "clientId": "INITIAL_ACCESS_TOKEN",
  "clientSecret": "INITIAL_REFRESH_TOKEN"
}
```

4. Make file `package.json` and prefill it with:

```json
{
  "accessToken": "INITIAL_ACCESS_TOKEN",
  "refreshToken": "INITIAL_REFRESH_TOKEN",
  "expiryTimestamp": 0
}
```

5. Add your packages
6. Build your package.
7. Modify `config.json` as you wish. Field `channel` is the most important one. `prefix` and `gameMap` can be changed as long as they're using the same format.
