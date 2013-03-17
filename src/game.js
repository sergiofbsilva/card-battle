z = {};
z.logIndex = 0;
$("#logs").empty();

z.log = function (msg) {
  $("#logs").prepend("<div>" + z.logIndex++ + ":"  + msg + "</div>");
};

z.json = function (obj) {
    return JSON.stringify(obj);
};

var types = ["S", "C", "H", "D"];
var ords = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

function getCardValue(card) {
  if (card.length === 2) {
    return card[0];
  } else {
    return card[0] + card[1];
  }
  
}
function Card(card) {
  return {
    compare: function(otherCardObj) {
              var otherCard = otherCardObj.value;
              var cardIndex = ords.indexOf(getCardValue(card));
              var otherCardIndex = ords.indexOf(getCardValue(otherCard));
              var diff = cardIndex - otherCardIndex;
      if (cardIndex === -1 || otherCardIndex === -1) {
              z.log("HOUVE MERDA " + cardIndex + "," + otherCardIndex);
      }
              if (diff > 0) {
                return 1;
              } else if (diff < 0) {
                return -1;
              } else {
                return 0;
              }
           },
    value : card
  };
}

function initDeck() {
  var cards = [];
  $(types).each(function(i,eType) {
    $(ords).each(function(i,eOrd) {
        var card = eOrd + eType;
        cards.push(new Card(card));
    });
  });
  return cards;
}

var deck = initDeck();
var p2Deck = [];
var indexes = [];

while(indexes.length < 26) {
  var index = Math.floor(Math.random()*51); 
  if(indexes.indexOf(index) == -1) {
    indexes.push(index);
  }
}


var p1Deck = [];
$(indexes).each(function(i,e) { p2Deck.push(deck[e]); });

for(var i=0; i < deck.length; i++) {
  if(indexes.indexOf(i) != -1) {
    p1Deck.push(deck[i]);
  }
}


function shuffle(o){ //v1.0
  for(var j, x, i = o.length; i; ) {
    j = parseInt(Math.random() * i);
    x = o[--i];
    o[i] = o[j];
    o[j] = x;
  }
    return o;
}

deck = shuffle(deck);
p2Deck = shuffle(p2Deck);

//z.log(p1Deck.length + z.json(p1Deck));
//z.log(p2Deck.length + z.json(p2Deck));


var players = [{ name : "Sergio", deck : p1Deck}, {name : "Artur", deck : p2Deck}];
var currentPlayer = 0;

function otherPlayer() {
  return currentPlayer === 0 ? 1 : 0;
}

function nextPlayer() {
  currentPlayer = otherPlayer(); 
}


function finished() {
  return players[0].deck.length === 0 || players[1].deck.length === 0; 
}

function whichPlayerWon() {
  if (finished()) {
    return (players[0].deck.length === 0 ? 1 : 0);
  }
  return -1;
}

function play(p1, p2) {
  var p1Card = p1.deck.pop();
  var p2Card = p2.deck.pop();
  
  $("#p1Card").html(p1Card.value);
  $("#p2Card").html(p2Card.value);

  var compare = p1Card.compare(p2Card);
  if( compare > 0) {
    p1.deck.unshift(p1Card);
    p1.deck.unshift(p2Card);
    $("#result").html(p1.name + " won");
  } else if (compare < 0){
    p2.deck.unshift(p1Card);
    p2.deck.unshift(p2Card);
    $("#result").html(p2.name + " won");
  } else {
     $("#result").html("It is  a tie");
     p1.deck.unshift(p1Card);
     p1.deck.unshift(p2Card);   
  }
}

function startMatchGame(currentMatch) {
	var id = currentMatch.id;
	console.log(id);
	API.match.storeData(id, "p1", players[0], function() {
		API.match.storeData(id, "p2", players[1], function() {
			$("#p1Name").html(players[0].name);
			$("#p2Name").html(players[1].name);	
		});	
	});
	
	$("#play").click(function(e) {
		API.match.retrieveData(id, "p1", function(p1) {
				API.match.retrieveData(id, "p2", function(p2) {

					play(p1,p2);

					API.match.storeData(id, "p1", p1, function() {
						log("p1 saved");
					});
		
					API.match.storeData(id, "p2", p2, function() {
						log("p2 saved");
					});	
				});
		});
	});
}

$(function() {
	API.match.request(1,1,function (e) {
			startMatchGame(e.match);	
	});
});

/*var i = 0;
while(i++ < 10000 && !finished()){
  var p1 = players[currentPlayer];
  var p2 = players[otherPlayer()];
  var p1Card = p1.deck.pop();
  var p2Card = p2.deck.pop();
  z.log("curr player : " + p1.name);
  z.log(p1.name + ":" + p1Card.value + " vs " + p2.name + ":" + p2Card.value);
  var compare =p1Card.compare(p2Card);
  if( compare > 0) {
    p1.deck.unshift(p1Card);
    p1.deck.unshift(p2Card);
    z.log(p1.name + " won");
  } else if (compare < 0){
    p2.deck.unshift(p1Card);
    p2.deck.unshift(p2Card);
    z.log(p2.name + " won");
  } else {
     z.log("It is  a tie");
     players[0].deck.unshift(p1Card);
     players[0].deck.unshift(p2Card);   
  }
  z.log("p1 : " + players[0].deck.length + " p2: " + players[1].deck.length);
  nextPlayer();
  z.log(i);
}*/