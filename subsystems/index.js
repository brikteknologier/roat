var subsystemNames = [
	'autostart',
	'github',
	'webui'
];

var subsystems = {};

subsystemNames.forEach(function (subsystemName) {
	subsystems[subsystemName] = require('./' + subsystemName);
});

module.exports = subsystems;
