require("babel-polyfill");
import Auth from './Auth';
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

let url = 'https://www.ztm.lublin.eu/api/query';

let auth = Auth.getAuth();

let numberOfFechedObject = 0;
let numberOfObjectsToFetch = 1;

export default module = {
    resetObjectsCounter(){
        numberOfFechedObject = 0;
    },

    setNumberOfObjectsToFetch(number){
        console.log("objects to fetch: "+number);
        numberOfObjectsToFetch=number;
    },

    getSchedulesDataFromZTE(){
        let requestData = {
            method:'schedules',
            auth: auth
        };

        return this.sendRequest(requestData);
    },

    getLinesDataFromZTE(){
        let requestData = {
            method:'lines',
            auth: auth
        };

        return this.sendRequest(requestData);
    },

    getBusstopsDataFromZTE(){
        let requestData = {
            method:'busstops',
            auth: auth
        };

        return this.sendRequest(requestData);
    },

    sendRequest(requestData){
        try{
            let request = new XMLHttpRequest();
            request.open("POST", url, false);  // `false` makes the request synchronous
            request.send(JSON.stringify(requestData));

            if (request.status === 200) {
                numberOfFechedObject++;
                console.log("fetched object number: "+numberOfFechedObject+"/"+numberOfObjectsToFetch);
                return JSON.parse(request.responseText).response;
            }
        }
        catch(e){
            console.log("request failed. trying to send again");
            return this.sendRequest(requestData);
        }
    },

    getLineWithBusstopPosition(line_no,schedule_id){
        let requestData = {
            method:'line',
            line_no: line_no,
            schedule_id: schedule_id,
            auth: auth
        };

        return this.getLineWithBusstopPositionRequest(requestData);
    },

    getLineWithBusstopPositionRequest(requestData){
        try{
            let request = new XMLHttpRequest();
            request.open("POST", url, false);  // `false` makes the request synchronous
            request.send(JSON.stringify(requestData));


            if (request.status === 200) {
                let responseText = JSON.parse(request.responseText)['response'];
                let responseObject = {};
                responseObject.line_no = requestData.line_no;
                responseObject.schedule_id = requestData.schedule_id;
                responseObject.data = responseText;
                numberOfFechedObject++;
                console.log("fetched object number: "+numberOfFechedObject+"/"+numberOfObjectsToFetch);
                return responseObject;
            }
        }
        catch(e){
            console.log("request failed. trying to send again");
            return this.getLineWithBusstopPositionRequest(requestData);
        }
    },

    getBusstopWithLineNumber(busstop_id,schedule_id){
        let requestData = {
            method:'line',
            busstop_no: busstop_id,
            schedule_id: schedule_id,
            auth: auth
        };

        return this.getBusstopWithLineNumberRequest(requestData);
    },

    getBusstopWithLineNumberRequest(requestData){
        try{
            let request = new XMLHttpRequest();
            request.open("POST", url, false);  // `false` makes the request synchronous
            request.send(JSON.stringify(requestData));

            if (request.status === 200) {
                let responseText = JSON.parse(request.responseText)['response'];
                let responseObject = {};
                responseObject.busstop_no = requestData.busstop_no;
                responseObject.schedule_id = requestData.schedule_id;
                responseObject.data = responseText;
                numberOfFechedObject++;
                console.log("fetched object number: "+numberOfFechedObject+"/"+numberOfObjectsToFetch);
                return responseObject;
            }
        }
        catch(e){
            console.log("request failed. trying to send again");
            return this.getBusstopWithLineNumberRequest(requestData);
        }
    },

    getLineAtBusstop(busstop_id,line_no,schedule_id){
        let requestData = {
            method:'lineAtBusstop',
            busstop_no: busstop_id,
            line_no: line_no,
            schedule_id: schedule_id,
            auth: auth
        };

        return this.getLineAtBusstopRequest(requestData);
    },

    getLineAtBusstopRequest(requestData){
        try{
            let request = new XMLHttpRequest();
            request.open("POST", url, false);  // `false` makes the request synchronous
            request.send(JSON.stringify(requestData));

            if (request.status === 200) {
                let responseText = JSON.parse(request.responseText)['response'];
                let responseObject = {};
                responseObject.busstop_no = requestData.busstop_no;
                responseObject.schedule_id = requestData.schedule_id;
                responseObject.line_no = requestData.line_no;
                responseObject.data = responseText;
                numberOfFechedObject++;
                console.log("fetched object number: "+numberOfFechedObject+"/"+numberOfObjectsToFetch);
                return responseObject;
            }
        }
        catch(e){
            console.log("request failed. trying to send again");
            return this.getLineAtBusstopRequest(requestData);
        }
    }
};