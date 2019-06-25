var startBlackjack = (function() {
    var suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
    var ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    var deck = [];
    var players = [];
    var currentPlayer = 0;
    
    function init() {
        players = [new Player('Dealer', 0)];
        var gameHTML = '';
        $('.game-body').show();
        $('#btnStart').hide();
    
        gameHTML += '<div class="status" id="status"></div>';
    
        gameHTML += '<div id="players" class="players">';
        gameHTML += '<div id="dealer"></div>';

        gameHTML += '<div>Current bet amount: </div>'
        gameHTML += '<div id="player"></div>';
        gameHTML += '</div>';
    
        gameHTML += '<div class="game-options">';
        gameHTML += '<button class="btn" id="startNewGame" onclick="startBlackjack.init()">New Game</button>';
        gameHTML += '<button class="btn btn-primary" id="hit" onclick="startBlackjack.hitMe()">Hit</button>';
        gameHTML += '<button class="btn" id="stand" onclick="startBlackjack.stand()">Stand</button>';
        gameHTML += '</div>';
    
        $('.game-body').html(gameHTML);
        
        // deal 2 cards to every player object
        currentPlayer = 1;
        createDeck();
        shuffle();
        createPlayers(1);
        $('#startNewGame').prop("disabled", true);
    }
    
    function createDeck() {
        deck = [];
        for (var i = 0 ; i < ranks.length; i++) {
            for(var x = 0; x < suits.length; x++) {
                var weight = parseInt(ranks[i]);
                if (ranks[i] == "J" || ranks[i] == "Q" || ranks[i] == "K") {
                    weight = 10;
                }
                   
                if (ranks[i] == "A") {
                    weight = 11;
                }
                    
                var card = { value: ranks[i], suit: suits[x], weight: weight };
                deck.push(card);
            }
        }
    }
    
    function Player(name, id) {
        this.name = name;
        this.playerId = id;
        this.score = 0;
        this.hand = [];
    }
    
    function createPlayers(num) {
        for(var i = 1; i <= num; i++) {
            var player = new Player('Player', i);
            players.push(player);
        }
        createPlayersUI(players);
        dealHandsAtStart();
        check();
    }
    
    function createPlayersUI(players) {
        var playersHTML = '';
        $('#players').html('');
       
        for(var i = 0; i < players.length; i++) {
            var playerHTML = '<div id='+players[i].name+' class="player">';
            
            if(players[i].name === "Dealer") {
                playerHTML += '<div id="deck" class="deck"><div id="deckcount">52</div></div>';
            }
    
            playerHTML += '<div class="playerName">'+players[i].name+'</div>';
            playerHTML += '<div id="hand_'+i+'" class="hand"></div>';
            playerHTML += '<div class="points" id="points_'+i+'"></div>';
    
            playerHTML += '</div>';
    
            playersHTML += playerHTML;
        }

        $('#players').html(playersHTML);
    }
    
    function shuffle() {
        for (var i = 0; i < 52; i++) {
            var location1 = Math.floor((Math.random() * deck.length));
            var location2 = Math.floor((Math.random() * deck.length));
            var tmp = deck[location1];
    
            deck[location1] = deck[location2];
            deck[location2] = tmp;
        }
    }

    function timer(ms) {
        return new Promise(res => setTimeout(res, ms));
    }

    // render card every 1 sec
    async function dealHandsAtStart() {

        for(var i = 0; i < 2; i++) {
            for (var player = 0; player < players.length; player++) {
                var card = deck.pop();
                players[player].hand.push(card);
                renderCard(card, player);
                updateDeck();
                calculateScore();
            
                await timer(1000);
            }
        }
        check();
    }

    function renderCard(card, player) {
        var cardUI = getCardUI(card),
            decTopPosition = $('#deck')[0].offsetTop,
            decLeftPosition = $('#deck')[0].offsetLeft

        cardUI.style.offsetTop = decTopPosition;
        cardUI.style.offsetLeft = decLeftPosition;

        var hand = $('#hand_' + player);
        moveCard(cardUI, hand)
        $(hand).append(cardUI);
    }
    
    function getCardUI(card) {
        var el = document.createElement('div');
        var icon = '';
    
        if (card.suit == 'Hearts') {
            icon='&hearts;';
        } else if (card.suit == 'Spades') {
            icon = '&spades;';
        } else if (card.suit == 'Diamonds') {
            icon = '&diams;';
        } else {
            icon = '&clubs;';
        }
        
        el.className = 'card';
        el.innerHTML = card.value + '<br/>' + icon;
        return el;
    }
    
    // calculate player score
    function getPoints(player) {
        var points = 0;
        for(var i = 0; i < players[player].hand.length; i++) {
            points += players[player].hand[i].weight;
        }
        players[player].score = points;
        return points;
    }
    
    function calculateScore() {
        for (var i = 0 ; i < players.length; i++)
        {
            getPoints(i);
            $('#points_'+i).text(players[i].name +' score: '+players[i].score);
            // document.getElementById('points_' + i).innerHTML = 
        }
    }

    function moveCard(card, hand) {
        var cardLeftPosition = 20;
        $(card).css({ position : 'absolute', top : 17, left: 583 });

        if(hand[0].children.length > 0) {
            cardLeftPosition += hand[0].children.length * 82;
        }

        $(card).animate({
            top: hand[0].offsetTop,
            left:cardLeftPosition,
        }, 1000, function() {
            $(card).css({ position : 'relative', top : 0, left: 0})
        });
       
    }

    // Player options
    function hitMe() {
        var card = deck.pop();
        players[currentPlayer].hand.push(card);
        renderCard(card, currentPlayer);
        calculateScore();
        updateDeck();
        check();
    }

    function stand() {

        // if player hit stand, check dealer score and give another card if is less than 21
        while(players[0].score < 21) {
            var card = deck.pop();
            players[0].hand.push(card);
            renderCard(card, 0);
            calculateScore();
            updateDeck();
            check();
        }
    }
    
    // Get winner
    function end() {
        var winner = {},
        score = 0;
        
        for(var player = 0; player < players.length; player++) {
    
            if (players[player].score > score && players[player].score < 22) {
                winner = players[player];
                score = players[player].score;
            }
            
        }
        $('#hit').prop("disabled", true);
        $('#stand').prop("disabled", true);
        $('#startNewGame').prop("disabled", false);
        $('#status').text('Winner: ' + winner.name);
        $('#status').css('display','inline-block');
    }
    
    function check() {
        for (let player = 0; player < players.length; player++) {

            if (players[player].score >= 21) {
                end();
                break;
            }
        }
    }

    function updateDeck() {
        $('#deckcount').text(deck.length);
    }
    
    window.addEventListener('load', function(){
           
    });

    return {
        init: init,
        hitMe: hitMe,
        stand: stand
    }
})();
