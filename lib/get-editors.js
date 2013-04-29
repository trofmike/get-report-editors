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
var beautify = require('js-beautify').js_beautify;
var stream = fs.createWriteStream('result.txt');

var options = {
    clientCode: false
};

out: while (args.length > 0){
    var v = args.shift();
    switch (v) {
        case "-c":
        case "--clientCode":
            options.clientCode = true;
            break;
        case "-l":
        case "--lehaUi":
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

var clientCode = function (parsedJson) {
    var cells = parsedJson.tabs["Шапка"].result.data.Cells,
        styleMap = parsedJson.tabs["Шапка"].result.data.StyleMap,
        result = {
          type: 'tableMarkup',
          width: parsedJson.tabs["Шапка"].result.data.TotalWidth,
          // height: parsedJson.tabs["Шапка"].result.data.TotalHeight,
          columnsCount: parsedJson.tabs["Шапка"].result.data.ColumnsCount,
          cells: []
        };
        
    //Парсим контролы
    var convertEditor = function (editor) {
      switch (editor.xtype) {
        case "RIA.Form.Editors.TextField":
          return {
            type: 'textbox',
            cls: 'unstyled',
            size: ''
          };
        case "RIA.Form.Editors.NumberField":
          return {
            type: 'textbox',
            cls: 'unstyled',
            mask: '9',
            maskOptions: { "repeat": 100, "greedy": false }
          };
        case "RIA.Form.Editors.CheckBox":
          return {
            type: 'checkbox',
            cls: 'unstyled'
          };
        case "RIA.Form.Editors.DateField":
          return {
            type: 'datepicker',
            cls: 'unstyled'
          };
      }
      
    };

    _.each(cells, function(cell) {
      var item = {};
      if (!_.isEmpty(cell.text)) item.html = cell.text;
      if (!_.isUndefined(cell.colspan)) item.colspan = cell.colspan;
      if (!_.isUndefined(cell.rowspan)) item.rowspan = cell.rowspan;
      if (!_.isUndefined(cell.width)) item.width = cell.width;
      if (!_.isUndefined(cell.height)) item.height = cell.height;
      
      var style = _.pick(styleMap, cell.styleIndex);
      item.style = style[cell.styleIndex];


      //Если есть эдитор — добавляем его
      if (!_.isNull(cell.editor)) {
        var editor = convertEditor(cell.editor);
        if (!_.isUndefined(cell.code)) editor.editableDataRef = cell.code;
        if (!_.isUndefined(cell.width)) editor.width = cell.width;
        if (!_.isUndefined(cell.height)) editor.height = cell.height;

        item.items = [editor];
      }

        //Удаляем ненужные стили
        item.style = _.omit(item.style, [
          "border-top-style", 
          "border-left-style", 
          "border-right-style", 
          "border-bottom-style", 
          "border-color", 
          "border-width",
          "font-family",
          "color",
          "background-color"
        ]);
      
      result.cells.push(item);
    });

    result = beautify(JSON.stringify(result), {indent_size: 4, brace_style: 'expand'});
    stream.write(result);

};

var readFile = function (filename) {
    fs.readFile(filename, 'utf8', function(err, file) {
        if (err) {
            console.log('Error: ' + err);
            return;
        }

        if (file) {
            var parsedJson = JSON.parse(file);
            var result;
            if (checkStructure(parsedJson)) {
                if (options.clientCode) {
                    clientCode(parsedJson);
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