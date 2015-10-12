var path = require('path');
var fs = require('fs');

var staticFolderPath = 'subsystems/webui/static';
var vaguePath = path.relative(path.join(__dirname, staticFolderPath), require.resolve('vague-time'));
fs.symlinkSync(vaguePath, path.join(staticFolderPath, 'vagueTime.js'));