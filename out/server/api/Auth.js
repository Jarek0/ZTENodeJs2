'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _sha = require('sha1');

var _sha2 = _interopRequireDefault(_sha);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var clientId = '5239';
var apiSecret = 'b178e311df3baaae4e0ebfe9a92ee2c9';

exports.default = module = {
    getAuth: function getAuth() {
        var apiKey = (0, _md2.default)(Math.floor(new Date().getTime() / 1000).toString().concat(apiSecret));
        var sha1Code = (0, _sha2.default)(apiKey.toString().concat(clientId).concat(apiSecret));

        return {
            clientId: clientId,
            apiKey: apiKey,
            sha: sha1Code
        };
    }
};