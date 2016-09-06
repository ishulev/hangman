(function(){
	'use strict';
	window.onload = function() {
		var hangmanApp = angular.module('hangmanApp', ['ngComponentRouter']);

		hangmanApp.config(function($locationProvider) {
			$locationProvider.html5Mode(true);
		})
		.value('$routerRootComponent', 'newGame')
		.component('newGame', {
			templateUrl: 'ng-templates/template-new-game.html',
			bindings: {
				categories: '<',
				multiplayer: '<',
				startGame: '&',
				setPlayersInfo: '&',
				setCategory: '&'
			},
			controller: function(){
				this.playerNames = [];
				this.notPopulated = true;
				this.setPlayerCount = function(count){
					var playerCount = [];
					for (var i = 0; i < count; i++) { 
						playerCount.push(i) 
					} 

					return playerCount;
				};
				this.checkOverallValidation = function(){
					if(this.missingNumbers == false && this.missingNames == false){
						this.notPopulated = false;
					}
				};
				this.checkNumValues = function(){
					if(1 > this.numOfWords || 'undefined' == typeof this.numOfWords || 2 > this.numOfPlayers || 'undefined' == typeof this.numOfPlayers) {
						this.missingNumbers = true;
					}
					else {
						this.missingNumbers = false;
						if(!this.missingNames && 'undefined' !== typeof this.missingNames){
							this.notPopulated = false;
							this.setPlayersInfo({playersInfo: {playerNames: this.playerNames, numOfWords: this.numOfWords}});
						}
					}
				};
				this.preSetPlayerNames = function(object){
					if(object.value.length < 1){
						this.missingNames = true;
						return;
					}
					else {
						this.playerNames[object.num - 1] = object.value;
					}
					for(var i = 0; i < this.numOfPlayers; i++) {
						if('undefined' == typeof this.playerNames[i] || this.playerNames[i].length < 1) {
							this.missingNames = true;
							return;
						}
					}
					this.missingNames = false;
					if(!this.missingNumbers){
						this.notPopulated = false;
						this.setPlayersInfo({playersInfo: {playerNames: this.playerNames, numOfWords: this.numOfWords}});
					}
				};
			}
		})
		.component('gameComponent', {
			templateUrl: 'ng-templates/template-game-component.html',
			bindings: {
				selectedData: '<',
				finishedGame: '&',
				guessedLetters: '&'
			},
			controller: function(){
				var randomWordIndex = 0;
				var foundMatches = [];
				var that = this;
				function randomizeWord(){
					randomWordIndex = Math.floor(Math.random() * (that.selectedData.length));
					that.currentWord = that.selectedData[randomWordIndex];
				}
				randomizeWord();
				this.$onChanges = function(changesObj){
					if('undefined' !== typeof changesObj.selectedData.previousValue[0]){
						randomizeWord();
					}
				};
				this.revealedLetters = [];
				this.hangmanPhase = 0;
				function wrongLGuess(){
					that.hangmanPhase ++;
				}
				this.wordCheck = function(word){
					if(word.toLowerCase() == this.currentWord.answer.toLowerCase()){
						this.finishedGame({result: {outcome: 'win', wordGuess: true}});
						this.hangmanPhase = 'win';
					}
					else {
						this.finishedGame({result: {outcome: 'defeat'}});
						this.hangmanPhase = 'defeat';
					}
				};
				this.letterCheck = function(letter){
					// If letter has already been guessed
					if(-1 !== foundMatches.indexOf(letter)){
						wrongLGuess();
						return;
					}
					var matchingIndexes = [];
					var answerString = this.currentWord.answer;
					// Remove last letter, because we don't need to test that
					answerString = answerString.slice(0, -1);
					// Remove first letter
					answerString = answerString.slice(1);
					if(-1 !== answerString.indexOf(letter)) {
						matchingIndexes.push(answerString.indexOf(letter) + 1);
						var i=0;
						do {
							var index = answerString.indexOf(letter, matchingIndexes[i]);
							matchingIndexes.push(index+1);
							i++;
						}
						while (matchingIndexes[i] !==-1 && matchingIndexes[i] !==0);
						// Remove last -1 || 0
						matchingIndexes.pop();
					}

					if(-1 !== matchingIndexes[0] && matchingIndexes.length > 0) {
						this.revealedLetters = this.revealedLetters.concat(matchingIndexes);
						foundMatches.push(letter);
						this.guessedLetters({number: matchingIndexes.length});
						if(this.revealedLetters.length == answerString.length){
							this.finishedGame({result: {outcome: 'win', wordGuess: false}});
						}
					}
					else {
						wrongLGuess();
					}
				};
			}
		})
		.component('wordComponent', {
			templateUrl: 'ng-templates/template-word-component.html',
			bindings: {
				wordObject: '<',
				revealedLetters: '<'
			},
			controller: function(){
			}
		})
		.component('scribbleComponent', {
			templateUrl: 'ng-templates/template-scribble-component.html',
			bindings: {
				answer: '<',
				revealedLetters: '<'
			},
			controller: function(){
				this.scribble = this.answer.split('');
			}
		})
		.component('letterGuess', {
			templateUrl: 'ng-templates/template-letter-guess.html',
			bindings: {
				letterCheck: '&'
			},
			controller: function(){
				this.letter = '';
				this.guessCounter = 5;
				this.preLetterCheck = function(){
					if(this.letter.length == 1){
						this.letterCheck({letter: this.letter});
						this.guessCounter--;
						this.letter = '';
					}
				};
			}
		})
		.component('wordGuess', {
			templateUrl: 'ng-templates/template-word-guess.html',
			bindings: {
				wordCheck: '&'
			},
			controller: function(){
				this.guessCounter = 1;
				this.word = '';
				this.preWordCheck = function(){
					if(this.word.length > 4){
						this.wordCheck({word: this.word});
						this.guessCounter--;
					}
				};
			}
		})
		.component('stats', {
			templateUrl: 'ng-templates/template-stats.html',
			bindings: {
				playerStats: '<',
				mode: '<'
			}
		})
		.component('overlay', {
			templateUrl: 'ng-templates/template-overlay.html',
			bindings: {
				result: '<'
			},
			controller: function(){
				this.result = {};
				this.$onChanges = function(changesObj){
					if('undefined' !== typeof changesObj.result.currentValue){
						if('win' == this.result.outcome) {
							this.message = 'Correct!';
						}
						else {
							this.message = 'Wrong :(';
						}
					}
				};
			}
		})
		.component('multiplayerResults', {
			templateUrl: 'ng-templates/template-mplayer-results.html',
			bindings: {
				stats: '<'
			},
			controller: function(){
				// Make a copy, before parent resets this.stats
				this.localStats = this.stats.slice();
				this.winner = {name: '', by: ''};
				var that = this;
				function loopForWinner(looper, criteria){
					var length = looper.length;
					var counter = 0;
					var result;
					for(var i=0; i < length; i++){
						if(counter < looper[i].stats[criteria]){
							counter = looper[i].stats[criteria];
							result = {name: looper[i].player, by: criteria};
						}
						else if(counter == looper[i].stats[criteria]){
							result = false;
						}
					}
					return result;
				}
				function findWinner(){
					if(!loopForWinner(that.localStats, 'gamesWon')){
						if(!loopForWinner(that.localStats, 'guessedWords')){
							that.winner = loopForWinner(that.localStats, 'guessedLetters');
						}
						else {
							that.winner = loopForWinner(that.localStats, 'guessedWords');
						}
					}
					else {
						that.winner = loopForWinner(that.localStats, 'gamesWon');
					}
				}
				findWinner();
				console.log('after loop');
			}
		});

		hangmanApp.factory('conundrums', function($http){
			return {
				getData: function(callback){
					$http.get('data/data.json').success(callback);
				}
			};
		});
		hangmanApp.filter('singleOrNot', function() {
			return function(input, multiplayer) {
				input = input || '';
				var out = '';
				if (!multiplayer) {
					out = 'Multiplayer';
				}
				else {
					out = 'Singleplayer';
				}
				return out;
			};
		})
		hangmanApp.controller('HangmanParentController', function ($scope, $timeout, conundrums){
			var completeData;
			$scope.categories = [];
			$scope.multiplayer = false;
			$scope.numOfWords = 0;
			$scope.numOfPlayers = 0;
			$scope.missingNumbers = false;
			$scope.startGameState = true;
			$scope.endgame = false;
			$scope.multiTotalStats = [];
			$scope.playerNames = [];
			var stats = {
				totalGames: 0,
				gamesWon: 0,
				gamesLost: 0,
				guessedLetters: 0,
				guessedWords: 0
			};
			$scope.playerStats = {
				player: 'Single Player',
				stats: stats
			};
			conundrums.getData(function(data) {
				completeData = data;
				$scope.categories = Object.keys(data);
			});
			$scope.setPlayersInfo = function(playersInfo){
				console.log(playersInfo);
				$scope.playerNames = playersInfo.playerNames;
				$scope.numOfWords = playersInfo.numOfWords;
				$scope.numOfPlayers = playersInfo.playerNames.length;
			};
			$scope.guessedLetters = function(number){
				$scope.playerStats.stats.guessedLetters += number;
			};
			$scope.setCategory = function(cat){
				$scope.category = cat;
			};
			var that = $scope;
			var multiPlayerTurn = 1;
			var multiWordCount = 1;
			function multiplayerStart(){
				that.playerStats.player = $scope.playerNames[multiPlayerTurn-1];
				that.category = that.categories[Math.floor(Math.random() * (that.categories.length))];
			}
			function resetStats(){
				that.playerStats.stats = {
					totalGames: 0,
					gamesWon: 0,
					gamesLost: 0,
					guessedLetters: 0,
					guessedWords: 0
				};
			}
			$scope.finishedGame = function(result){
				if('win' == result.outcome){
					if(true == result.wordGuess){
						$scope.playerStats.stats.guessedWords++;
					}
					$scope.playerStats.stats.gamesWon++;
				}
				else {
					$scope.playerStats.stats.gamesLost++;
				}
				$scope.playerStats.stats.totalGames++;
				$scope.result = {
					display: true,
					outcome: result.outcome
				};
				if($scope.multiplayer){
					$scope.startGameState = true;
					// Next player time OR endgame
					if($scope.numOfWords == multiWordCount) {
						// var currentPlayer = $scope.playerStats;
						$scope.multiTotalStats.push(JSON.parse(JSON.stringify($scope.playerStats)));
						multiWordCount = 1;
						// ENDGAME
						if($scope.numOfPlayers == multiPlayerTurn){
							$scope.endgame = true;
						}
						// Next player
						else {
							multiPlayerTurn++;
							resetStats();
						}
					}
					// Load next word for same player
					else {
						multiWordCount++;
					}
				}
				$timeout(function(){
					$scope.result.display = false;
					if(!$scope.multiplayer || $scope.multiplayer && $scope.endgame){
						resetStats();
						$scope.multiTotalStats = [];
						$scope.startGameState = true;
						multiPlayerTurn = 1;
						multiWordCount = 1;
					}
					else {
						$scope.startGame();
					}
				}, 3000);
			};
			$scope.startGame = function(){
				if(this.multiplayer){
					if($scope.playerStats.player == 'Single Player'){
						multiPlayerTurn = 1;
						multiWordCount = 1;
						resetStats();
					}
					this.missingNumbers = false;
					multiplayerStart();
				}
				else if($scope.playerStats.player !== 'Single Player'){
					$scope.playerStats.player = 'Single Player';
					resetStats();
				}
				this.selectedData = completeData[this.category];
				this.endgame = false;
				this.startGameState = false;
			}
		});
		hangmanApp.directive('categoryButton', function() {
			return {
				restrict: 'E',
				scope: {
					key: '=',
					onClick: '&'
				},
				require: '^^newGame',
				replace: true,
				template: '<button class="btn">{{key}}</button>',
				link: function(scope, element, attrs, parentCtrl){
					element.on('click', function(){
						element.parent().children().removeClass('btn-primary');
						element.addClass('btn-primary');
						parentCtrl.setCategory({category: scope.key});
					});
				}
			};
		});

		angular.bootstrap(document, ['hangmanApp']);
	};
})();