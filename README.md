# Lazybum

A simple self-bot which switches games without typing `!game SUPERLONGNAMEFORAGAME` in chat. Requires Nightbot running in the channel.

This bot is dedicated for the laziest streamer in the world. FeelsWeirdMan 👉 beastyZF

## Requirements

- NodeJS at least ES2015/ES6 compatible. [Read compatibility list here](https://node.green/#ES2015).
- Yarn or npm.

## Init

1. Make directory called `.config`
2. Copy `config.json.example` to `.config` directory and rename it to `config.json`
3. Create your app in Twitch developer dashboard
4. Get client id and client secret from your app. Store it in `config.json` and prefill it in these fields:

```json
{
  "clientId": "CLIENT_ID",
  "clientSecret": "CLIENT_SECRET"
}
```

5. Make file `package.json` inside `config/` directory and prefill it with:

```json
{
  "accessToken": "INITIAL_ACCESS_TOKEN",
  "refreshToken": "INITIAL_REFRESH_TOKEN",
  "expiryTimestamp": 0
}
```

Access token and refresh token can be obtained by generating Twitch OAuth token. [I've made a simple express app for this](https://github.com/daftmaple/twitch-oauth-token). This app will also use the same clientId and clientSecret.

6. Add your packages
7. Build your package.
8. Modify `config.json` as you wish. Field `channel` is the most important one. `prefix` and `gameMap` can be changed as long as they're using the same format.

## Docker

Configuration file and tokens are shipped inside the container

```sh
docker build -t lazybum .
docker run --detach  --name lazybum-container -v <PATH_TO_CONFIG_DIR>:/usr/src/.config lazybum
```

Path to config directory is `$PWD/config` for Unix. Reminder that running WSL1 docker cli with Windows docker daemon [needs special treatment for volume mounting](https://stackoverflow.com/questions/60088530/wsl1-docker-desktop-volume-mounts-are-always-empty):

```sh
docker run --detach  --name lazybum-container -v $(wslpath -w $(pwd)/.config):/usr/src/.config/ lazybum
```
