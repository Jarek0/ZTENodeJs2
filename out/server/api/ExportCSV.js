'use strict';

module.exports = {
    createRow: function createRow(feature) {
        var row = '';
        //dla każdego przejazdu
        var keys = Object.keys(feature);
        for (var i = 0; i < keys.length; i++) {
            row += feature[keys[i]];
            row += ';';
        }
        row += '\n';
        return row;
    },
    prepare: function prepare(query) {
        var rows = [];
        var row = void 0;
        //stworzenie nagłówków
        row = 'Id Przystanku;Kierunek;Czas potrzebny na dojazd;Wspolrzedna x;Wspolrzedna y;Numer przystanku;Numer linii' + '\n';
        rows.push(row);
        //dla każdego przystanku tworzy się wiersz pliku csv
        for (var i = 0; i < query.length; i++) {
            for (var j = 0; j < query[i].length; j++) {
                row += createRow(query[i][j]);
            }

            //wprowadzenie numeru przystanku

            //dodanie rzędu do tablicy rzędów
            rows = row;
        }
        return rows;
    },
    download: function download(query) {
        var filename = 'autobusy.csv';

        var fs = require('fs');

        fs.writeFile('form-tracking/formList.csv', query, 'utf8', function (err) {
            if (err) {
                console.log('Some error occured - file either not saved or corrupted file saved.');
            } else {
                console.log('It\'s saved!');
            }
        });
        var blob = new Blob([query], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) {
            // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            var link = document.createElement('a');
            if (link.download !== undefined) {
                // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
};