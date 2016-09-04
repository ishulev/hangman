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
				missingNumbers: '<',
				setNumOfWords: '&',
				setNumOfPlayers: '&',
				setCategory: '&'
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
				var randomWordIndex = Math.floor(Math.random() * (this.selectedData.length));
				var foundMatches = [];
				var that = this;
				this.revealedLetters = [];
				this.hangmanPhase = 0;
				function wrongLGuess(){
					that.hangmanPhase ++;
				}
				this.currentWord = this.selectedData[randomWordIndex];
				this.wordCheck = function(word){
					if(word.toLowerCase() == this.currentWord.answer.toLowerCase()){
						this.finishedGame({result: 'win'});
						this.hangmanPhase = 'win';
					}
					else {
						this.finishedGame({result: 'defeat'});
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
					matchingIndexes.push(answerString.indexOf(letter));
					var i=0;
					do {
						matchingIndexes.push(answerString.indexOf(letter, matchingIndexes[i]+1));
						i++;
					}
					while (matchingIndexes[i] !==-1 && matchingIndexes[i] !==0 && matchingIndexes[i] !==matchingIndexes.length-1);

					// Remove last -1
					matchingIndexes.pop();
					if(-1 !== matchingIndexes[0]) {
						console.log('Match Found!');
						this.revealedLetters = this.revealedLetters.concat(matchingIndexes);
						foundMatches.push(letter);
						this.guessedLetters({number: matchingIndexes.length});
					}
					else {
						console.log('No match!');
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
			},
			controller: function(){
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
							this.message = 'You WON!';
						}
						else {
							this.message = 'You lost :(';
						}
					}
				};
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
			var stats = {
				totalGames: 0,
				gamesWon: 0,
				gamesLost: 0,
				guessedLetters: 0,
				guessedWords: 0
			};
			$scope.playerStats = {
				player: 'Player 1',
				stats: stats
			};
			conundrums.getData(function(data) {
				completeData = data;
				$scope.categories = Object.keys(data);
			});
			$scope.guessedLetters = function(number){
				stats.guessedLetters += number;
			};
			$scope.setCategory = function(cat){
				$scope.category = cat;
			};
			$scope.setNumOfWords = function(event){
				$scope.numOfWords = event.target.valueAsNumber;
			};
			$scope.setNumOfPlayers = function(event){
				$scope.numOfPlayers = event.target.valueAsNumber;
			};
			$scope.finishedGame = function(result){
				if('win' == result){
					stats.gamesWon++;
					stats.guessedWords++;
				}
				else {
					stats.gamesLost++;
				}
				stats.totalGames++;
				$scope.result = {
					display: true,
					outcome: result
				};
				$timeout(function(){
					$scope.result.display = false;
					$scope.startGameState = true;
				}, 3000);
			};
			$scope.startGame = function(){
				if(this.multiplayer){
					if(this.numOfWords === 0 || this.numOfPlayers === 0){
						this.missingNumbers = true;
						return;
					}
					else {
						this.missingNumbers = false;
					}
				}
				this.selectedData = completeData[this.category];
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