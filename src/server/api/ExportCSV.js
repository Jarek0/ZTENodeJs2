
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
        row = 'Id Przystanku;Kierunek;Czas potrzebny na dojazd;Wspolrzedna x;Wspolrzedna y;Numer przystanku;Numer linii'+'\n';
        rows.push(row);
        //dla każdego przystanku tworzy się wiersz pliku csv
        for(let i = 0;i<query.length;i++){
            for(let j=0;j<query[i].length;j++){
                row+=createRow(query[i][j]);
            }
            rows=(row);
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
