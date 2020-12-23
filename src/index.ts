import fs from 'fs';

import {
  AccessToken,
  RefreshableAuthProvider,
  StaticAuthProvider,
} from 'twitch-auth';
import { ChatClient } from 'twitch-chat-client';

const clientConfig = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

const clientId: string = clientConfig.clientId;
const clientSecret: string = clientConfig.clientSecret;
const botChannel: string = clientConfig.channel;
const botAllowedUsers: string[] = clientConfig.allowedUsers;
const botPrefix: string = clientConfig.prefix;
const botGames: Record<string, string> = clientConfig.gameMap;

if (!clientId || !clientSecret) {
  console.error('CLIENT_ID or CLIENT_SECRET is undefined');
  process.exit(1);
}

const tokenData = JSON.parse(fs.readFileSync('./tokens.json', 'utf-8'));

const authProvider = new RefreshableAuthProvider(
  new StaticAuthProvider(clientId, tokenData.accessToken),
  {
    clientSecret,
    refreshToken: tokenData.refreshToken,
    expiry:
      tokenData.expiryTimestamp === null
        ? null
        : new Date(tokenData.expiryTimestamp),
    onRefresh: async ({
      accessToken,
      refreshToken,
      expiryDate,
    }: AccessToken) => {
      const newTokenData = {
        accessToken,
        refreshToken,
        expiryTimestamp: expiryDate === null ? null : expiryDate.getTime(),
      };
      fs.writeFileSync(
        './tokens.json',
        JSON.stringify(newTokenData, null, 4),
        'utf-8'
      );
    },
  }
);

const chatClient = new ChatClient(authProvider, { channels: [botChannel] });

chatClient.connect();
chatClient.onConnect(() => {
  console.log('Bot has been connected');
});

chatClient.onMessage((channel, user, message, msg) => {
  if (
    channel.replace('#', '') === botChannel &&
    message.startsWith(botPrefix)
  ) {
    // Ensure that the command is invoked in the channel
    if (botAllowedUsers.indexOf(user) !== -1) {
      // User is in the allowed users list
      const args: string[] = message.trim().split(' ');
      const cmd = args[0].replace(botPrefix, '');
      const response = commandHandler(cmd, [...args.slice(1)]);
      if (response) {
        chatClient.say(channel, response);
      }
    } else {
      chatClient.say(
        channel,
        'You are not allowed to use this command. Whisper me for access.'
      );
    }
  }
});

type CommandHandler = (args: string[]) => string | null;

function commandHandler(cmd: string, args: string[]): string | null {
  const commands: Record<string, CommandHandler> = {
    g: setGame,
    w: weirdChamp,
  };

  if (commands[cmd]) {
    return commands[cmd](args);
  }

  return null;
}

function setGame(game: string[]): string | null {
  if (game.length < 1) return null;

  const parsedGame = botGames[game[0]];
  if (parsedGame) {
    return `!game ${parsedGame}`;
  }

  return null;
}

function weirdChamp(): string {
  return 'WeirdChamp';
}
