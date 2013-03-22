#! /usr/bin/env node

/*
 * get-editors
 * https://github.com/trofmike/get-report-editors
 *
 * Copyright (c) 2013 Mikhail Trofimov
 * Licensed under the MIT license.
 */
var args = process.argv.slice(2);
var filename;
var fs = require('fs');
var _ = require('underscore');
var stream = fs.createWriteStream('result.txt');

var options = {
    clientCode: false
};

out: while (args.length > 0) {
    var v = args.shift();
    switch (v) {
      case "-c":
      case "--clientCode":
        options.clientCode = true;
        break;
      default:
        filename = v;
        break out;
    }
}

var checkStructure = function (file) {
    if (_.has(file, 'tabs') && _.has(file.tabs, 'Шапка') && _.has(file.tabs["Шапка"], 'result') && _.has(file.tabs["Шапка"].result, 'data') && _.has(file.tabs["Шапка"].result.data, 'Cells')) {
        return true;
    } else {
        return false;
    }
};
var readFile = function (filename) {
    fs.readFile(filename, 'utf8', function(err, file) {
        if (err) {
            console.log('Error: ' + err);
            return;
        }
        // console.log(file);
        if (file) {
            var parsedJson = JSON.parse(file);
            var result;
            if (checkStructure(parsedJson)) {
                if (options.clientCode) {
                    result = {};
                    var splitted = filename.split('Page', 2);
                    var pageNumber = splitted[1].match(/[0-9]*/);
                    var newArr = [];
                    
                    _.each(parsedJson.tabs["Шапка"].result.data.Cells, function(obj) {
                        if (!_.isNull(obj.editor)) {
                            newArr.push(obj.code);
                        }
                    });
                    var someObj = {};
                    someObj[pageNumber] = newArr;

                    // var string = JSON.stringify(someObj);
                    if (_.isUndefined(result)) {
                        result = {};
                    }

                   _.extend(result, someObj);
                   result = JSON.stringify(result);
                   result = result.slice(1, -1) + ',';
                   stream.write(result); 


                } else {
                    result = '';
                    result = result + '\n# ---- ' + filename + ' --------\n';
                    _.each(parsedJson.tabs["Шапка"].result.data.Cells, function(obj) {
                        if (!_.isNull(obj.editor)) {
                            result = result + ('self._get_dict(u"'+ obj.code +'"),\n');
                        }
                    });
                    stream.write(result);                    
                }
                
                console.log(filename + " Done");
                
            }
            else {
                console.log('В файле ' + filename + ' нарушена структура.');
            }
            
        }
        
    });
};

if (_.isUndefined(filename)) {
    fs.readdir('.', function (err, files) {
         if (err)
            throw err;
         files.sort();
         _.each(files, function(file, index, list){
            if (_.first(file.split('.').slice(1)) === 'json') {
                readFile(file);
            }
         });

     });
} else {
    readFile(filename);
    
}

stream.on("end", function() {
    console.log("${CHECK} Done");
  stream.end();
});