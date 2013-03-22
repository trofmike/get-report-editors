# get-editors

Get report editors from json from BARS SVODY extJs configs

## Getting Started
Install the module with: `npm install get-editors`

## options

-c or --clientCode — makes code for client-side like
```javascript
1: ["ИННЮЛ", "КПП", "Стр", "НомКорр", "Период", "ОтчетГод", "КодНО", "ПоМесту", "НаимОрг",
    "ОКВЭД", "ФормРеорг", "Тлф", "КоличествоСтраниц", "КоличествоПриложений", "ПрПодп",
    "ПодписантФИО", "СвПредНаимОрг", "ДатаДок", "СвПредНаимДок"],
```

## Examples
If you have folder full of json's, make just
```bash
get-editors
```
or if you want to build one file, use
```bash
get-editors file.json
```

## License
Copyright (c) 2013 Mikhail Trofimov  
Licensed under the MIT license.
