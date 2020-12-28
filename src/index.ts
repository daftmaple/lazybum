import fs from 'fs';

import {
  AccessToken,
  RefreshableAuthProvider,
  StaticAuthProvider,
} from 'twitch-auth';
import { ChatClient } from 'twitch-chat-client';
import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage';

const clientConfig = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const botVersion: string = JSON.parse(
  fs.readFileSync('./package.json', 'utf-8')
).version;

type UserType = 'broadcaster' | 'mod' | 'vip' | 'sub';

const clientId: string = clientConfig.clientId;
const clientSecret: string = clientConfig.clientSecret;
const botChannel: string = clientConfig.channel;
const botAllowedUsers: string[] = clientConfig.allowedUsers;
const botPrefix: string = clientConfig.prefix;
const botGames: Record<string, string> = clientConfig.gameMap;
const botName: string = clientConfig.botName;
const permitW: Record<UserType, boolean> = clientConfig.permitW;

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
  console.log(`Bot has been connected`);
  console.log(`Bot username: ${botName}`);
  console.log(`Bot version: ${botVersion}`);
});

type CommandArguments = {
  client: ChatClient;
  channel: string;
  args: string[];
  message: string;
  user: string;
  msg: TwitchPrivateMessage;
};

type CommandHandler = (arg: CommandArguments) => void;

chatClient.onMessage((channel, user, message, msg) => {
  const args: string[] = message.trim().split(' ');
  const cmd = args[0].replace(botPrefix, '');
  const params = {
    client: chatClient,
    channel,
    args: [cmd, ...args.slice(1)],
    message,
    user,
    msg,
  };

  if (
    channel.replace('#', '') === botChannel &&
    message.startsWith(botPrefix)
  ) {
    // Ensure that the command is invoked in the channel
    const commands: Record<string, CommandHandler> = {
      g: setGame,
      w: weirdChamp,
      v: packageVersion,
    };

    if (commands[cmd]) {
      commands[cmd](params);
    }
  } else {
    checkIfSongIsRequested(params);
  }
});

function setGame({ client, channel, args, user }: CommandArguments) {
  if (botAllowedUsers.indexOf(user) === -1) {
    client.say(
      channel,
      'You are not allowed to use this command. Whisper me for access.'
    );
    return;
  }

  if (args.length < 2) {
    client.say(channel, 'Game is needed');
    return;
  }

  const parsedGame = botGames[args[1]];
  if (!parsedGame) {
    client.say(channel, 'Game is not found');
    return;
  }

  client.say(channel, `!game ${parsedGame}`);
}

function weirdChamp({ client, channel, args, user, msg }: CommandArguments) {
  const isAllowed =
    (msg.userInfo.isBroadcaster && permitW.broadcaster) ||
    (msg.userInfo.isMod && permitW.mod) ||
    (msg.userInfo.isVip && permitW.vip) ||
    (msg.userInfo.isSubscriber && permitW.sub);
  if (args.length > 1 && isAllowed) {
    client.say(channel, `WeirdChamp ${args[1]}`);
  } else {
    client.say(channel, `WeirdChamp ${user}`);
  }
}

function packageVersion({ client, channel }: CommandArguments) {
  client.say(channel, `Version ${botVersion}`);
}

function checkIfSongIsRequested({
  client,
  channel,
  message,
}: CommandArguments) {
  if (message.match(/song.*\?/)) {
    client.say(channel, `!song`);
  }
}
