import AlgorithmMaster from './api/AlgorithmMaster'

let express = require('express'),
app = express(),
PORT = 3000;

app.get('/drop', async (req, res) => {
    res.status(200).json(AlgorithmMaster.getDataFromZTMAndSaveItToCSV(true));
});

app.get('/', async (req, res) => {
    res.status(200).json(AlgorithmMaster.getDataFromZTMAndSaveItToCSV(false));
});

app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`)
});
