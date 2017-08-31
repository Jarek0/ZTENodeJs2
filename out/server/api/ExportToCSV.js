'use strict';

function createRow(feature) {
    var row = '';
    //dla każdego przejazdu
    for (var i = 0; i < Object.keys(feature).length; i++) {
        row += feature[i];
        //jeżeli i przyjmuje przedostatnią wartość(parametry przystanku) to wyciągnij je i dodaj do rzędu
        if (i == feature.size - 1) {
            for (var j = 0; j < feature[i].length; j++) {
                row += feature[i][j] + ';';
            }
        }
        row += ';';
    }
    row += '\n';
    return row;
}
function prepare(query) {
    var rows = [];
    var row;
    //stworzenie nagłówków
    row = 'numer linii:' + query[0][0] + ';kierunek:' + query[0][1] + '\n';
    rows.push(row);
    row = 'Numer przystanku;Czas potrzebny na dojazd;';
    //pętla z ilością odjazdów. w każdej dodawany średnik- przeskok do następnej komórki
    for (var j = 1; j < Object.keys(query[1]).length - 1; j++) {
        row += ';';
    }
    row += 'Przystanek; Wspolrzedna x; Wspolrzedna y';
    row += '\n';
    rows.push(row);
    //dla każdego przystanku tworzy się wiersz pliku csv
    for (var i = 1; i < query.length; i++) {
        //wprowadzenie numeru przystanku
        row = '' + i + ';';
        row += createRow(query[i]);
        //dodanie rzędu do tablicy rzędów
        rows.push(row);
    }
    return rows;
}
function download(query) {
    var filename = 'autobusy.csv';
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