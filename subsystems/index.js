var subsystemNames = [
	'autostart',
	'bitbucket',
	'github',
	'webui'
];

var subsystems = {};

subsystemNames.forEach(function (subsystemName) {
	subsystems[subsystemName] = require('./' + subsystemName);
});

module.exports = subsystems;
