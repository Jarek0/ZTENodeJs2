import md5 from 'md5';
import sha1 from 'sha1';

let clientId = '5239';
let apiSecret = 'b178e311df3baaae4e0ebfe9a92ee2c9';

export default module={
    getAuth: function() {
        let apiKey = md5((Math.floor(new Date().getTime() / 1000)).toString().concat(apiSecret));
        let sha1Code = sha1((apiKey).toString().concat(clientId).concat(apiSecret));

        return {
            clientId: clientId,
            apiKey: apiKey,
            sha: sha1Code
        };
    }
};
