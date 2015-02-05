// Get the lib
var irc = require("irc"),
	blackjack = require("./blackjack.js");

var config = {
	server: "irc.afternet.org",
	userName: 'GameBot',
	realName: 'GameBot by Kimau',
	port: 6697,
	autoConnect: true,
	channels: [
	//"#PixelPit", 
	"#GameBotSandbox"],
	secure: true,
	encoding: 'UTF-8',
	// localAddress: null,
	debug: true,
	// showErrors: false,
	// autoRejoin: false,
	// selfSigned: false,
	// certExpired: false,
	// floodProtection: false,
	// floodProtectionDelay: 1000,
	// sasl: false,
	// stripColors: false,
	// channelPrefixes: "&#",
	messageSplit: 512
};

// Create the bot name
var bot = new irc.Client(config.server, config.userName, {
	channels: config.channels
});
/*
bot.addListener('message', function (from, to, message) {
    console.log(from + ' => ' + to + ': ' + message);
});

bot.addListener('pm', function (from, message) {
    console.log(from + ' => ME: ' + message);
});

bot.addListener('message#yourchannel', function (from, message) {
    console.log(from + ' => #yourchannel: ' + message);
});*/

bot.addListener('message', function (from, to, message) {
	if(message.indexOf("!playBlackjack") >= 0) {
		if(bot.blackjack)
			return;

		bot.blackjack = new blackjack.newGame(bot, to);
	}

});



// say, action, notice
