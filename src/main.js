const Discord = require('discord.js');
const config = require('config');
const pinger = require("minecraft-server-util");
const cron = require("node-cron");
const i18n = require("i18n");

const prefix = "/status ";
const client = new Discord.Client();

i18n.configure({
  locales: ['en', 'ja'],
  defaultLocale: config.locale,
  directory: __dirname + '/../locales',
});

client.on('ready', () => {
  console.log(i18n.__('log.login', { user: client.user.tag }));
});

cron.schedule(config.event, async () => {
  await Promise.all(config.channels.map(channelData => {
    return (async () => {
      const guild = client.guilds.resolve(channelData.guild);
      if (guild === null)
        throw new Error(i18n.__('error.guild_id', { id: channelData.guild }));
      const channel = guild.channels.resolve(channelData.channel);
      if (channel === null)
        throw new Error(i18n.__('error.channel_id', { id: channelData.channel }));

      const timeDifference = Math.abs(new Date().getTime() - channelData.limit.getTime());
      const differentDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
      const topic = channelData.template.replace('{{remaining}}', differentDays);
      await channel.edit({topic});
    })();
  }));
});

client.login(config.token);