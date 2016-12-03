'use strict';

var typeTranslations = {
	normal: 'Normal',
	fighting: 'Kampf',
	flying: 'Flug',
	poison: 'Gift',
	ground: 'Boden',
	rock: 'Gestein',
	bug: 'Käfer',
	ghost: 'Geist',
	steel: 'Stahl',
	fire: 'Feuer',
	water: 'Wasser',
	grass: 'Pflanze',
	electric: 'Elektro',
	psychic: 'Psycho',
	ice: 'Eis',
	dragon: 'Drache',
	dark: 'Unlicht',
	fairy: 'Fee',
	nuclear: 'Nuklear'
};

var def = {
	bgColor: '#ffffff',
	textColor: '#000000',
	width: 400,
	height: 100,
	gap: 5,
	radius: 10,
	nameSize: 32,
	nameTop: 5,
	nameLeft: 10,
	typeSize: 16,
	typeBottom: 10,
	typeLeft: 10,
	spriteScale: 1,
	spriteX: 0,
	autoApply: true,
	lock: false
};

var app = angular.module('Uranium', []);

app.controller('TeamController', ['$scope', function($scope) {
	$scope.settings = {};
	
	$scope.settingsReset = function() {
		for (var prop in def) {
			$scope.settings[prop] = def[prop];
		}
	};
	$scope.settingsReset();
	
	$scope.team = [{}, {}, {}, {}, {}, {}];
	$scope.mockTeam = [{}, {}, {}, {}, {}, {}];
	
	if (localStorage) {
		if (localStorage.team) {
			var data = JSON.parse(localStorage.team);
			for (var i = 0; i < $scope.mockTeam.length; i++) {
				if (data[i]) {
					if (data[i].identity) $scope.mockTeam[i].identity = data[i].identity;
					if (data[i].nickname) $scope.mockTeam[i].nickname = data[i].nickname;
					if (data[i].isNuclear) $scope.mockTeam[i].isNuclear = true;
					if (data[i].isMega) $scope.mockTeam[i].isMega = true;
					if (data[i].isShiny) $scope.mockTeam[i].isShiny = true;
				}
			}
		}
		if (localStorage.settings) {
			var data = JSON.parse(localStorage.settings);
			for (var prop in def) {
				if (data.hasOwnProperty(prop)) $scope.settings[prop] = data[prop];
			}
		}
	}
	
	$scope.apply = function(pkmn) {
		if (!pkmn.identity) return;
		var pokemon = new Pokemon(pkmn);
		var index = $scope.mockTeam.indexOf(pkmn);
		$scope.team[index] = pokemon;
	};
	
	$scope.applyAll = function() {
		for (var pkmn of $scope.mockTeam) {
			$scope.apply(pkmn);
		}
	}
	
	$scope.isValid = function(pkmn) {
		return findPkmn(pkmn.identity) ? true : false;
	};
	
	$scope.moveUp = function(index) {
		var tempTeam = $scope.team[index], tempMock = $scope.mockTeam[index];
		$scope.mockTeam[index] = $scope.mockTeam[index - 1];
		$scope.mockTeam[index - 1] = tempMock;
		if (!$scope.settings.autoApply) return;
		$scope.team[index] = $scope.team[index - 1];
		$scope.team[index - 1] = tempTeam;
	};
	
	$scope.moveDown = function(index) {
		var tempTeam = $scope.team[index], tempMock = $scope.mockTeam[index];
		$scope.mockTeam[index] = $scope.mockTeam[index + 1];
		$scope.mockTeam[index + 1] = tempMock;
		if (!$scope.settings.autoApply) return;
		$scope.team[index] = $scope.team[index + 1];
		$scope.team[index + 1] = tempTeam;
	};
	
	$scope.remove = function(index) {
		$scope.mockTeam[index] = {};
		$scope.team[index] = {};
	};
	
	$scope.translateType = function(type) {
		return typeTranslations[type] || type;
	};
	
	$scope.saveTeam = function() {
		if (localStorage) {
			localStorage.setItem('team', JSON.stringify($scope.mockTeam));
		}
	};
	
	$scope.saveSettings = function() {
		if (localStorage) {
			localStorage.setItem('settings', JSON.stringify($scope.settings));
		}
	};
}]);

var Pokemon = function(pkmn) {
	var template = findPkmn(pkmn.identity);
	if (!template) throw 'Pokemon konnte nicht erstellt werden: Name oder ID nicht gefunden';
	
	for (var prop in template) {
		this[prop] = template[prop];
	}
	
	this.nickname = pkmn.nickname;
	this.isNuclear = pkmn.isNuclear;
	this.isMega = pkmn.isMega;
	this.isShiny = pkmn.isShiny;
	this.image = 'img/' + leadingZeroes(this.id, 3) + (this.isMega && this.mega ? 'm' : '') + (this.isNuclear && this.nuclear ? 'n' : '') + (this.isShiny ? 's' : '') + '.png';
	
	// TEMPORARY
	if (this.isNuclear && this.nuclear) this.type[1] = 'nuclear';
	
	Object.defineProperty(this, 'displayName', {get: function() {
		return this.nickname || this.name;
	}});
};

var findPkmn = function(identity) {
	if (!window.pkmnData) throw 'pkmnData nicht gefunden';
	
	identity = tryToInt(identity);
	
	for (var pkmn of pkmnData) {
		if (pkmn.id === identity || pkmn.name === identity) return pkmn;
		if (typeof identity === 'string' && pkmn.name.toLowerCase() === identity.toLowerCase()) return pkmn;
	}
	return false;
};

var tryToInt = function(str) {
	try {
		var num = parseInt(str);
		if (isNaN(num)) return str;
		return num;
	} catch (e) {
		return str;
	}
};

var leadingZeroes = function(num, len) {
	var str = '' + num;
	while (str.length < len) {
		str = '0' + str;
	}
	return str;
};
