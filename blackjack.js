// Get the lib
var randUtil = require("./randomUtil.js");

function getCardUnicode(card) {
	var uc = [
		["\u0001\uF0A1","\u0001\uF0A2","\u0001\uF0A3","\u0001\uF0A4","\u0001\uF0A5","\u0001\uF0A6","\u0001\uF0A7","\u0001\uF0A8","\u0001\uF0A9","\u0001\uF0AA","\u0001\uF0AB","\u0001\uF0AC","\u0001\uF0AD","\u0001\uF0AE"],
		["\u0001\uF0D1","\u0001\uF0D2","\u0001\uF0D3","\u0001\uF0D4","\u0001\uF0D5","\u0001\uF0D6","\u0001\uF0D7","\u0001\uF0D8","\u0001\uF0D9","\u0001\uF0DA","\u0001\uF0DB","\u0001\uF0DC","\u0001\uF0DD","\u0001\uF0DE"],
		["\u0001\uF0B1","\u0001\uF0B2","\u0001\uF0B3","\u0001\uF0B4","\u0001\uF0B5","\u0001\uF0B6","\u0001\uF0B7","\u0001\uF0B8","\u0001\uF0B9","\u0001\uF0BA","\u0001\uF0BB","\u0001\uF0BC","\u0001\uF0BD","\u0001\uF0BE"],
		["\u0001\uF0C1","\u0001\uF0C2","\u0001\uF0C3","\u0001\uF0C4","\u0001\uF0C5","\u0001\uF0C6","\u0001\uF0C7","\u0001\uF0C8","\u0001\uF0C9","\u0001\uF0CA","\u0001\uF0CB","\u0001\uF0CC","\u0001\uF0CD","\u0001\uF0CE"],
		["\u0001\uF0A0","\u0001\uF0BF","\u0001\uF0CF","\u0001\uF0DF"]];

	var uStr = "";
	if(card)
		return uc[card[0]][card[1]];
	else
		return uc[4][0];
}

function getCardAscii(card) {
	var s = ["\u2660","\u2663","\u2665","\u2666"];
	var v = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
	if(card) {
		var aStr = "";
		if(s < card[0])
			return "\u00031,0[" + s[card[0]] + v[card[1]] + "]\u000F";
		else
			return "\u00034,0[" + s[card[0]] + v[card[1]] + "]\u000F";
	}

	return "[#]";
}

function GetHandAsText(h) {
	var s = " " + h.map(getCardAscii).join(""); // h.map(getCardUnicode).join("") +" "+
	console.log(s);
	return s;
}

var BlackJackJS = function(bot, channel) {
	this.getHandValue = function(hand) {
		var handVal = 0;
		var aceInHand = 0;
		for (var i = 0; i < hand.length; i++) {
			if(hand[i][1] == 0)
				aceInHand += 1;
			
			handVal += Math.min(hand[i][1],9)+1;
		};


		if(handVal <= 11 && aceInHand  > 0)
			return handVal+10;
		return handVal;
	};

	this.getHand = function(nick) {
		if(this.players[nick] == undefined) {
			this.bot.say(nick, "Your not in the game, ask me to !deal you in");
			return;
		};

		this.bot.say(nick, "Your hand is " + GetHandAsText(this.players[nick].cards) + " = " + this.players[nick].blackjackVal);
	};

	this.dealIn = function(nick) {
		if(this.players[nick] != undefined) {
			this.bot.say(nick, "Your already in this hand");
			return;
		}

		var h = [this.deck.pop(), this.deck.pop()];
		this.players[nick] = {
			called: false,
			cards: h,
			blackjackVal: this.getHandValue(h)
		};
		this.getHand(nick);
		this.bot.say(this.channel, "Dealt in " + nick);

		console.log("Dealt in " + nick + ":" + this.players[nick]);
	};

	this.hitMe = function(nick) {
		if(this.players[nick] == undefined) {
			this.bot.say(nick, "Your not in the game, ask me to !deal you in");
			return;
		};
		if(this.players[nick].called) {
			this.bot.say(nick, "You have called no more cards.");
			return;
		}
		if(this.players[nick].blackjackVal > 21) {
			this.bot.say(nick, "Your bust! No new cards.");
		}

		this.players[nick].cards.push(this.deck.pop());
		this.players[nick].blackjackVal = this.getHandValue(this.players[nick].cards);
		if(this.players[nick].blackjackVal > 21)
		{
			this.players[nick].called = true;
			this.bot.say(nick, "BUST!");
		}

		this.getHand(nick);
		this.checkGameOver();

		console.log("Hit in " + nick + ":" + this.players[nick]);
	};

	this.callHand = function(nick) {
		if(this.players[nick] == undefined) {
			this.bot.say(nick, "Your not in the game, ask me to !deal you in");
			return;
		};
		if(this.players[nick].called) {
			this.bot.say(nick, "Already Called!");
			return;
		}

		this.players[nick].called = true;
		this.bot.say(this.channel, nick + " has called");
		this.checkGameOver();
	};

	this.checkGameOver = function() {
		var players = [];
		for(i in this.players) {
			if(this.players[i].called == false)
				return;

			if(i==0)
				players.push(["Dealer", this.players[i]]);
			else
				players.push([i, this.players[i]]);
		}

		players.sort(function(a,b) { return a[1].blackjackVal - b[1].blackjackVal; });

		var text = players.reduce(function(a,b) { 
			return a + "\n" + b[0]+":"+GetHandAsText(b[1].cards)+"="+b[1].blackjackVal; }, "");
		this.bot.say(this.channel, "Hand over " + text);
		delete(this.bot.blackjack);
	};

	this.notifyNewJoiner = function(channel, nick, message) {
		this.bot.say(channel, "Welcome ask me to !deal you into Blackjack");
	};

	this.someoneSpoke = function (nick, text, message) {
		if(text.indexOf("!deal") >= 0)
			this.dealIn(nick);
		else if(text.indexOf("!hit") >= 0)
			this.hitMe(nick);
		else if(text.indexOf("!call") >= 0)
			this.callHand(nick);
	};

	this.nickChanged = function (oldnick, newnick, channels, message) {
		if(oldnick in this.players)
		{
			this.players[newnick] = this.players[oldnick];
			delete(this.players[oldnick]);
		}
	};
	
	// Create Deck
	this.deck = [];
	for (var i = 0; i < 4; i++)
		for (var d = 0; d < 13; d++)
			this.deck.push([i,d]);
	randUtil.shuffle(this.deck);

	// Dealer Hand
	var dealerHand = [this.deck.pop(), this.deck.pop()];
	this.players = {};
	this.players[0] = {
		called: true,
		cards: dealerHand,
		blackjackVal: this.getHandValue(dealerHand)
	};

	// Bot Setup
	this.bot = bot;
	this.channel = channel;

	var myGame = this;

	this.bot.addListener('join'+channel, function(channel, nick, message) { return myGame.notifyNewJoiner(channel, nick, message); });
	this.bot.addListener('message'+channel, function(nick, text, message) { return myGame.someoneSpoke(nick, text, message); });
	this.bot.addListener('nick', myGame.nickChanged);
	this.bot.say(channel, "Blackjack has started ask me to !deal you in");
	this.bot.say(channel, "Dealer: " + GetHandAsText([dealerHand[0], undefined]));

	return this;
};

module.exports = {
	newGame: BlackJackJS
};