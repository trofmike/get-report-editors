#! /usr/bin/env node

/*
 * get-editors
 * https://github.com/trofmike/get-report-editors
 *
 * Copyright (c) 2013 Mikhail Trofimov
 * Licensed under the MIT license.
 */
var file = process.argv.slice(2);

var fs = require('fs');
var _ = require('underscore');
var result = '';


fs.readFile(file[0], 'utf8', function(err, file) {
	if (err) {
		console.log('Error: ' + err);
		return;
	}
	if (file) {
		var parsedJson = JSON.parse(file);
		
		// console.dir(parsedJson);
		_.each(parsedJson.tabs["Шапка"].result.data.Cells, function(obj) {
			if (!_.isNull(obj.editor)) {
				result = result + ('self._get_dict(u"'+ obj.code +'"),\n');
			}
		});
	}

	fs.writeFile('result.txt', result, function (err) {
        if (err)
           throw err;
        console.log('Done!');
	});
	// data.toString('utf8');
});



// fs.writeFile("result.py", result, function(err) {
//     if(err) {
//         console.log(err);
//     } else {
//         console.log("The file was saved!");
//     }
// }); 