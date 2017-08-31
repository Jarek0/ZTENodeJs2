
function createRow(feature) {
    let row = '';
    //dla każdego przejazdu
    let keys =Object.keys(feature);
    for(let i = 0;i<keys.length;i++) {
        row += feature[keys[i]];
        row += ';';
    }
    row += '\n';
    return row;
}

module.exports={
    prepare: function(query) {
        let rows = [];
        let row;
        //stworzenie nagłówków
        row = 'Numer linii;Kierunek;Id przystanku;Pozycja;Wspolrzedna x;Wspolrzedna y;Roznica czasu'+'\n';
        rows.push(row);
        //dla każdego przystanku tworzy się wiersz pliku csv
        for(let i = 0;i<query.length;i++){
            row=createRow(query[i]);
            rows.push(row);
        }
        return rows;
    },
    download: function(query) {
        let fs = require('fs');
        fs.writeFile('autobusy.csv', query, 'utf8', function (err) {
            if (err) {
                console.log('Some error occured - file either not saved or corrupted file saved.');
            } else{
                console.log('Its saved!');
            }
        });
    }
};
