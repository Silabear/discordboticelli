const Discord = require("discord.js");
const bot = new Discord.Client();
const token = process.env.TOKEN;
const PREFIX = "..";
const ms = require("ms");
var version = "1.0.2";
var servers = {};
const ytdl = require("ytdl-core");

bot.on("ready", () => {
  console.log("Bear Bot Online");
  bot.user
    .setActivity("DM And Server", {
      type: "WATCHING"
    })
    .catch(console.error);
});
bot.on("message", message => {
  let args = message.content.substring(PREFIX.length).split(" ");
  //This is our Command handler
  switch (args[0]) {
    case "ping":
      message.channel.send

    case "pong":
      message.channel.send("ping");
      break;

    case "toast":
      message.channel.send("Eat toast for breakfast");
      break;

    case "version":
      message.channel.send("Running version **" + version + "**");
      break;

    case "clear":
      message.channel.bulkDelete(args[1]);
      break;
    
    case "kick":
      if (!args[1])
        message.channel.send(
          "**Well, who are you going to kick then? *missing argument 1* **"
        );
      const user = message.mentions.users.first();
      if (user) {
        const member = message.guild.member(user);
        if (member) {
          member.kick("You were kicked!").then(() => {
            message.channel.send("Kicked " + member);
          });
        }
      }
    break;
      
    case "ban":
      if (!message.member.roles.find(r => r.name === "Admin"))
        return message.reply("Sorry, you do not have the right roles");
      if (!args[1])
        message.channel.send(
          "**Well, who are you going to ban then? *missing argument 1* **"
        );
      const userban = message.mentions.users.first();
      if (userban) {
        const memberban = message.guild.member(userban);
        if (memberban) {
          memberban.ban("You were banned!").then(() => {
            message.channel.send("Banned " + memberban);
          });
        }
      }
      break;

    case "mute":
      if (!message.member.roles.find(r => r.name === "Admin"))
        return message.reply("Sorry, you do not have the right roles");
      let person = message.guild.member(
        message.mentions.users.first() || message.guild.members.get(args[1])
      );
      if (!person) return message.reply("Could not find member");

      let mainrole = message.guild.roles.find(role => role.name === "Bears");
      let muterole = message.guild.roles.find(role => role.name === "Muted");

      if (!muterole) return message.reply("Could not find role * **Muted** *.");0

      let time = args[2];

      if (!time) {
        return message.reply("You did not specify a time!");
      }

      person.removeRole(mainrole.id);
      person.addRole(muterole.id);

      message.channel.send(
        `@${person.user.tag} has been muted for ${ms(ms(time))}`
      );

      setTimeout(function() {
        person.addRole(mainrole.id);
        person.removeRole(muterole.id);
        message.channel.send(`@${person.user.tag} has been unmuted.`);
      }, ms(time));

      break;

    case "purge":
      if (!message.member.roles.find(r => r.name === "Admin"))
        return message.reply("Sorry, you do not have the right roles");
      let personR = message.guild.member(
        message.mentions.users.first() || message.guild.members.get(args[1])
      );
      if (!personR) return message.reply("Could not find member");

      let mainroleR = message.guild.roles.find(role => role.name === "Newbie");
      let muteroleR = message.guild.roles.find(role => role.name === "Admin");

      if (!muteroleR)
        return message.reply("Could not find role * **Admin** *.");

      let timeR = args[2];

      if (!timeR) {
        return message.reply("You did not specify a time!");
      }

      personR.removeRole(mainroleR.id);
      personR.addRole(muteroleR.id);
      message.channel.send(
        `@${personR.user.tag} has been purged for ${ms(ms(timeR))}`
      );

      setTimeout(function() {
        personR.addRole(mainroleR.id);
        personR.removeRole(muteroleR.id);
        message.channel.send(`@${personR.user.tag} has been unpurged`);
      }, ms(timeR));

      break;

    case "unpurge":
      let pso = message.guild.member(message.mentions.users.first());
      let main = message.guild.roles.find(role => role.name === "Newbie");
      let adminrole = message.guild.roles.find(role => role.name === "Admin");
      pso.removeRole(adminrole.id);
      pso.addRole(main.id);
      message.channel.send("Unpurged!");
      break;

    case "unmute":
      if (!message.member.roles.find(r => r.name === "Admin"))
        return message.reply("Sorry, you do not have the right roles");
      let ppso = message.guild.member(message.mentions.users.first());
      let mainD = message.guild.roles.find(role => role.name === "Bears");
      let muteD = message.guild.roles.find(role => role.name === "Muted");
      ppso.removeRole(muteD.id);
      ppso.addRole(mainD.id);
      message.channel.send("Unmuted!");
      break;

    case "play":
      function play(connection, message) {
        var server = servers[message.guild.id];
        server.dispatcher = connection.playStream(
          ytdl(server.queue[0], { filter: "audioonly" })
        );
        console.log('Playing')
        server.queue.shift();
        server.dispatcher.on("end", function() {
          if (server.queue[0]) {
            play(connection, message);
          } else {
            connection.disconnect();
          }
        });
      }

      if (!args[1]) {
        message.reply("You must provide me a link to play!");
        return;
      }

      if (!message.member.voiceChannel) {
        message.reply("Please join a voice channel");
        return;
      }

      if (!servers[message.guild.id])
        servers[message.guild.id] = {
          queue: []
        };

      var server = servers[message.guild.id];

      server.queue.push(args[1]);

      if (!message.guild.voiceConnection)
        message.member.voiceChannel.join().then(function(connection) {
          play(connection, message);
        });
      message.channel.send("Attempting to play...");
      break;

    case "skip":
      if (!message.member.roles.find(r => r.name === "Admin"))
        return message.reply("Sorry, you do not have the right roles");
      var server = servers[message.guild.id];
      if (server.dispatcher) server.dispatcher.end();
      message.channel.send("Skipped current track!");
      break;

    case "stop":
      if (!message.member.roles.find(r => r.name === "Admin"))
        return message.reply("Sorry, you do not have the right roles");
      var server = servers[message.guild.id];
      if (message.guild.voiceConnection) {
        for (var i = server.queue.length - 1; i >= 0; i--) {
          server.queue.splice(i, 1);
        }

        server.dispatcher.end();
        console.log("Stopped the queue!");
        message.channel.send("Stopped the music!");
      }

      if (message.guild.voiceConnection)
        message.guild.voiceConnectiom.disconnect();
      break;
      
    case 'help':
      message.author.send('https://cdn.glitch.com/53bb2525-701b-41fc-93a9-a13e9fe0decd%2FCommands.txt?v=1581672973049');
      break;
  }
});
bot.login(token);
