'use strict';

function createRow(feature) {
    var row = '';
    //dla każdego przejazdu
    var keys = Object.keys(feature);
    for (var i = 0; i < keys.length; i++) {
        row += feature[keys[i]];
        row += ';';
    }
    row += '\n';
    return row;
}

module.exports = {
    prepare: function prepare(query) {
        var rows = [];
        var row = void 0;
        //stworzenie nagłówków
        row = 'Numer linii;Kierunek;Id przystanku;Pozycja;Wspolrzedna x;Wspolrzedna y;Roznica czasu' + '\n';
        rows.push(row);
        //dla każdego przystanku tworzy się wiersz pliku csv
        for (var i = 0; i < query.length; i++) {
            for (var j = 0; j < query[i].length; j++) {
                row += createRow(query[i][j]);
            }
            rows = row;
        }
        return rows;
    },
    download: function download(query) {
        var fs = require('fs');
        fs.writeFile('autobusy.csv', query, 'utf8', function (err) {
            if (err) {
                console.log('Some error occured - file either not saved or corrupted file saved.');
            } else {
                console.log('Its saved!');
            }
        });
    }
};