const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
let fs = require('fs');

export default module= {
    readTextFile(file) {
        let rawFile = new XMLHttpRequest();
        rawFile.open("GET", 'file:///ZTENodeJs2/'+file, false);
        rawFile.setRequestHeader('Content-Type', 'application/json');
        rawFile.send();

        return JSON.parse(rawFile.responseText);
    },

    saveToFile(path,object){
        fs.writeFile(path, '', function(){console.log('done')})
        fs.writeFile(path, JSON.stringify(object), function(err) {
            if(err) {
                return console.log(err);
            }
        });
    }
}


