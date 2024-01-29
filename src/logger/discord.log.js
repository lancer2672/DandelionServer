const { Client, GatewayIntentBits } = require("discord.js");

const{
    DISCORD_BOT_TOKEN,
DISCORD_CHANNEL_ID,
}  = process.env
class LoggerService {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    this.channelId = DISCORD_CHANNEL_ID;
    this.token = DISCORD_BOT_TOKEN;
    this.client.on('ready', () => {
      console.log("Logger is ready", this.client.user.tag);
    });

    this.client.on('messageCreate', (msg) => {
      if(msg.author.bot) return;

      if(msg.content ==='hi'){
        msg.reply("Hi");
      }
    });
  }

  sendToMessage (message = "message"){
    const channel = this.client.channels.cache.get(this.channelId);
    if(!channel){
        console.log("Cannot find channel")
        return 
    }
    channel.send(message).catch(e =>console.error(e))
  }
  sendToFormatCode (logData) {
    const {code, message= "Message",title = ""} =logData;
    const codeMessage = {
        content: message,
        embeds:[
            {
                //convert hex color to int
                color:parseInt('00ff00',16) 
                ,title,
                description: '```json\n' + JSON.stringify(code,null,2) + '\n```'

            }
        ]
    }
    this.sendToMessage(codeMessage)
  }
  start() {
    this.client.login(this.token);
  }
}
const loggerService = new LoggerService();
loggerService.start();

module.exports = loggerService