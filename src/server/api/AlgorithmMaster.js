import Network from './Network';
import ExportCSV from './ExportCSV'
import Database from './Database'

let schedules = {};
let lines = {};
let busstops = {};
let linesWithBusstopsPosition = {};
let busstopsWithLineNumber = {};
let linesAtBusstop = {};

let preparedBusstops = {};

export default module={
    getDataFromZTMAndSaveItToCSV(dropDatabase){

        if(dropDatabase)
        {
            this.getNewDataFromZTM();
            this.saveDataToDatabase();
        }
        else{
            this.getDataFromDatabase();
        }

        this.prepareBusstopsBeforeCalculateResults();
        this.calculateResults();
    },

    getNewDataFromZTM(){
        console.log("start download data from ZTM server");
        console.log("start fetching schedules");
        schedules = Network.getSchedulesDataFromZTE();
        Network.resetObjectsCounter();
        console.log("schedules fetched");
        let actualSchedule = schedules.find(schedule =>{ return new Date(schedule['date_start'])<new Date() && new Date(schedule['date_stop'])>new Date()});

        console.log("start fetching lines");
        lines = Network.getLinesDataFromZTE();
        Network.resetObjectsCounter();
        console.log("lines fetched");

        console.log("start fetching bus stops");
        busstops = Network.getBusstopsDataFromZTE();
        Network.resetObjectsCounter();
        console.log("bus stops fetched");

        console.log("start fetching lines with bus stops position");
        Network.setNumberOfObjectsToFetch(Object.keys(lines).length);
        linesWithBusstopsPosition = [];

        for(let line in lines){
            linesWithBusstopsPosition.push(Network.getLineWithBusstopPosition(line,actualSchedule.id));
        }

        Network.resetObjectsCounter();
        console.log("lines with bus stops position fetched");

        console.log("start fetching bus stops with line number");
        Network.setNumberOfObjectsToFetch(busstops.length);
        busstopsWithLineNumber = [];

        busstops.forEach( busstop => {
            busstopsWithLineNumber.push(Network.getBusstopWithLineNumber(busstop.id,actualSchedule.id));
        });

        Network.resetObjectsCounter();
        console.log("bus stops with line number fetched");

        console.log("start fetching lines at bus stop");

        let numberOfLinesAtBusstopRequests = 0;

        linesWithBusstopsPosition.forEach( lineWithBusstopPosition => {
                if(lineWithBusstopPosition.data!==undefined)
                    lineWithBusstopPosition.data.forEach(
                        direction => {
                            direction.data.forEach( busstopOnLine => {
                                numberOfLinesAtBusstopRequests++;
                            });
                        }
                    )
            }
        );

        Network.resetObjectsCounter();
        Network.setNumberOfObjectsToFetch(numberOfLinesAtBusstopRequests);
        linesAtBusstop = [];

        linesWithBusstopsPosition.forEach( lineWithBusstopPosition => {
                if(lineWithBusstopPosition.data!==undefined)
                    lineWithBusstopPosition.data.forEach(
                        direction => {
                            direction.data.forEach( busstopOnLine => {
                                linesAtBusstop.push(Network.getLineAtBusstop(busstopOnLine.busstop,lineWithBusstopPosition.line_no,actualSchedule.id));
                            });
                        }
                    )
            }
        );
        console.log("lines at bus stops fetched");
        console.log("data from ZTM downloaded");
    },

    saveDataToDatabase(){
        Database.saveToFile('schedules.txt',schedules);
        Database.saveToFile('lines.txt',lines);
        Database.saveToFile('linesWithBusstopsPosition.txt',linesWithBusstopsPosition);
        Database.saveToFile('busstops.txt',busstops);
        Database.saveToFile('busstopsWithLineNumber.txt',busstopsWithLineNumber);
        Database.saveToFile('linesAtBusstop.txt',linesAtBusstop);
    },

    getDataFromDatabase(){
        schedules = Database.readTextFile("schedules.txt");
        lines = Database.readTextFile("lines.txt");
        linesWithBusstopsPosition = Database.readTextFile("linesWithBusstopsPosition.txt");
        busstops = Database.readTextFile("busstops.txt");
        busstopsWithLineNumber = Database.readTextFile("busstopsWithLineNumber.txt");
        linesAtBusstop = Database.readTextFile("linesAtBusstop.txt");
    },

    prepareBusstopsBeforeCalculateResults(){
        linesWithBusstopsPosition.forEach( lineWithBusstopPosition => {
                if(lineWithBusstopPosition.data!==undefined)
                    lineWithBusstopPosition.data.forEach(
                        direction => {
                            direction.data.forEach( busstopOnLine => {
                                let preparedBusstop = {};
                                preparedBusstop.line_no = linesWithBusstopsPosition.line_no;
                                preparedBusstop.schedule_id = linesWithBusstopsPosition.schedule_id;
                                preparedBusstop.direction_name = linesWithBusstopsPosition.direction_name;
                                preparedBusstop.id = busstopOnLine.busstop;
                                preparedBusstop.position = busstopOnLine.position-1;

                                let busstop = busstops.find(busStop => {return busStop.id === preparedBusstop.id});
                                preparedBusstop.latitude = busstop.latitude;
                                preparedBusstop.longitude = busstop.longitude;

                                preparedBusstops.push(preparedBusstop);
                            });
                        }
                    )
            }
        );
    },

    calculateResults() {
        let line=[];
        let leavesArray = [];
        let differences=[];
        linesAtBusstop = this.changeArray();
        let keys = Object.keys(linesAtBusstop);
        for(let i = 0;i<keys.length;i++) {
            let klucze = Object.keys(linesAtBusstop[keys[i]]);
            for (let j = 0; j <klucze.length; j++) {
                leavesArray = findTime(linesAtBusstop[keys[i]][klucze[j]]);
                if (leavesArray) {
                    differences.push(substractTime(leavesArray, preparedBusstops));
                }
            }

        }
        line=(ExportCSV.prepare(differences));
        ExportCSV.download(line);
    },

    changeArray() {
        let schedule={};
        preparedBusstops.forEach(busstop=>{
            if(!schedule[busstop.line_no]) {
                schedule[busstop.line_no] = {};
            }
            schedule[busstop.line_no][busstop.direction_name] = [];

        });
        preparedBusstops.forEach(
            (preparedBusstop) => {
                let element = linesAtBusstop.find((busstop) => {
                    return (preparedBusstop.line_no === busstop.line_no && busstop.busstop_no === preparedBusstop.id);
                });
                if (element !== undefined&&element.data!== undefined)
                {
                    element.data.direction_name=preparedBusstop.direction_name;
                    element.data.position=preparedBusstop.position;
                    let hours;
                    if(element.data.godziny['DZIEŃ POWSZEDNI, ROK SZKOLNY']){
                        hours = element.data.godziny['DZIEŃ POWSZEDNI, ROK SZKOLNY'];
                    }
                    else if(element.data.godziny['POWSZEDNI LETNI']){
                        hours = element.data.godziny['POWSZEDNI LETNI'];
                    }
                    else{
                        hours = element.data.godziny;
                    }

                    element.data.godziny=hours;
                    schedule[element.line_no][element.data.direction_name].push(element.data);
                }
            }
        );
        return schedule;
    },

    substractTime(leavesArray, busstopResponse){
        let ride = [];
        for(let i = 1; i<leavesArray.length; i++){
            ride[i-1]={};
            let result = leavesArray[i].leaveTime - leavesArray[i - 1].leaveTime;
            if (result < 0)
                result += 60;
            let directionName = leavesArray[i].dir;
            let coorX;
            let coorY;
            for(let j = 0; j<busstopResponse.length;j++){
                if(leavesArray[i].busstopId===busstopResponse[j].id){
                    coorX=busstopResponse[j].longitude;
                    coorY=busstopResponse[j].latitude;
                    break;
                }
            }
            ride[i-1]={id:leavesArray[i].busstopId,dir:directionName,diff:result,longitude:coorX,latitude:coorY, pos: leavesArray[i].pos, line_no:leavesArray[i].linia};
        }
        return ride;
    },

    loops(keys, stopsArray){
        let i = 0;
        for(let x = 0;x<keys.length;x++){
            for(let j = 0;j<stopsArray[0].godziny[keys[x]].length;j++){
                if(parseInt(keys[x])===7){
                    return i;
                }
                i++;
            }
        }
        return i;
    },

    findingLoops(stopsArray, keys, i) {
        let z = 0;
        console.log(stopsArray.godziny);
        for(let x = 0;x<keys.length;x++){
            let minutes = stopsArray.godziny[keys[x]];
            for(let w = 0; w<minutes.length;w++){
                if(i===z){
                    console.log(keys[x],minutes[w]);
                    console.log(minutes);
                    return {linia : stopsArray.linia, dir:stopsArray.direction_name, busstopId: stopsArray.przystanek, pos:stopsArray.position, leaveTime: minutes[w]};
                }
                z++;
            }
        }
    },

    findTime(stopsArray) {
        if (stopsArray[0]) {
            let leavesArray = [];
            console.log(stopsArray[0].direction_name);
            let keys = Object.keys(stopsArray[0].godziny);
            let i = loops(keys, stopsArray);
            for (let j = 0; j < stopsArray.length; j++) {
                keys = Object.keys(stopsArray[j].godziny);
                leavesArray.push(findingLoops(stopsArray[j], keys, i));
            }
            //console.log(leavesArray);
            return leavesArray;
        }
    }
};
