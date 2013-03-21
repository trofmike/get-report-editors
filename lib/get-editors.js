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
var stream = fs.createWriteStream('result.txt');


var readFile = function (filename) {
    fs.readFile(filename, 'utf8', function(err, file) {
        if (err) {
            console.log('Error: ' + err);
            return;
        }
        // console.log(file);
        if (file) {
            var parsedJson = JSON.parse(file);

            _.each(parsedJson.tabs["Шапка"].result.data.Cells, function(obj) {
                if (!_.isNull(obj.editor)) {
                    result = result + ('self._get_dict(u"'+ obj.code +'"),\n');
                }
            });
            stream.write(result);
        }
        
    });
};

var writeFile = function (result) {
    console.log('result =' + result);
    fs.writeFile('result.txt', result, function (err) {
        if (err)
           throw err;
        console.log('Done!');
    });
};


if (_.isEmpty(file)) {
    fs.readdir('.', function (err, files) {
         if (err)
            throw err;
         _.each(files, function(file){
            if (_.first(file.split('.').slice(1)) === 'json') {
                readFile(file);
            }
         });
            
            
         
     });
} else {
    readFile(file[0]);
}

stream.on("end", function() {
  stream.end();
});