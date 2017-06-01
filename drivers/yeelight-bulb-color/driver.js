"use strict";

var utils = require('/lib/utils.js');
var yeelights_color = {};

/* SELF */
var self = {
    init: function (devices_data, callback) {
        devices_data.forEach(function(device_data) {
            initDevice(device_data);
    	});
        Homey.log('Driver Yeelight Bulb Color initialized ...');
    	callback (null, true);
    },
    pair: function (socket) {
        socket.on('disconnect', function() {
            Homey.log ("User aborted pairing, or pairing is finished");
        });

        socket.on('test-connection', function( data, callback ) {
            utils.testConnection('toggle', data, function( err, result ) {
                if (err) {
                    Homey.log('Cannot send command: ' + err);
                    callback(err, null);
                } else {
                    callback(null, "Command send succesfully");
                }
            });
        });

        socket.on('add_device', function( device_data, callback ) {
            initDevice( device_data );
            callback( null, true );
        });
    },
    deleted: function (device_data, callback) {
        delete yeelights_color[device_data.id];
        callback( null, true );
    },
    settings: function (device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback) {
        try {
            changedKeysArr.forEach(function (key) {
                yeelights_color[device_data.id].data[key] = newSettingsObj[key];
                yeelights_color[device_data.id].settings[key] = newSettingsObj[key]
            })
            callback(null, true)
        } catch (error) {
            callback(error)
        }
    },
    capabilities: {
        onoff: {
    		get: function (device_data, callback) {
                utils.sendCommand('powered', 0, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(true, false);
                    } else {
                        callback(null, true);
                    }
                });
    		},
    		set: function (device_data, onoff, callback) {
                if (onoff) {
                    utils.sendCommand('turnon', 0, device_data.address, device_data.token, callback);
					module.exports.realtime(device_data, 'onoff', true);
					callback(null, true);
				} else {
                    utils.sendCommand('turnoff', 0, device_data.address, device_data.token, callback);
					module.exports.realtime(device_data, 'onoff', false);
					callback(null, false);
                }
    		}
    	},
        dim: {
		    get: function (device_data, callback) {
                utils.sendCommand('brightness', 0, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(null, 0);
                    } else {
                        callback(null, result);
                    }
                });
            },
            set: function (device_data, dim, callback) {
                utils.sendCommand('setbrightness', dim, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(err, dim);
                    } else {
                        module.exports.realtime(device_data, 'dim', dim);
                        callback(null, dim);
                    }
                });
            }
        },
        /*light_hue: {
		    get: function (device_data, callback) {
                utils.sendCommand('hue', 0, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(null, 0);
                    } else {
                        callback(null, result);
                    }
                });
            },
            set: function (device_data, light_hue, callback) {
                utils.sendCommand('sethue', light_hue, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(err, light_hue);
                    } else {
                        callback(null, light_hue);
                    }
                });
            }
        },
        light_saturation: {
		    get: function (device_data, callback) {
                utils.sendCommand('saturation', 0, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(null, 0);
                    } else {
                        callback(null, result);
                    }
                });
            },
            set: function (device_data, light_saturation, callback) {
                utils.sendCommand('setsaturation', light_saturation, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(err, light_saturation);
                    } else {
                        callback(null, light_saturation);
                    }
                });
            }
        },*/
        light_temperature: {
		    get: function (device_data, callback) {
                utils.sendCommand('colortemperature', 0, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(null, 0);
                    } else {
                        callback(null, result);
                    }
                });
            },
            set: function (device_data, light_temperature, callback) {
                utils.sendCommand('setcolortemperature', light_temperature, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(err, light_temperature);
                    } else {
                        module.exports.realtime(device_data, 'light_temperature', light_temperature);
                        callback(null, light_temperature);
                    }
                });
            }
        },
        light_mode: {
		    get: function (device_data, callback) {
                utils.sendCommand('colormode', 0, device_data.address, device_data.token, function( err, result ) {
                    if (err) {
                        callback(null, 'color');
                    } else {
                        callback(null, result);
                    }
                });
            }
        }
    }
}

module.exports = self

/* HELPER FUNCTIONS */
function initDevice(device_data) {
    Homey.manager('drivers').getDriver('yeelight-bulb-color').getName(device_data, function (err, name) {
        module.exports.getSettings(device_data, function( err, settings ) {
            yeelights_color[device_data.id] = {
                name: name,
                data: {
                    id: device_data.id,
                    address: settings.address,
                    token: settings.token
                }
            }
            yeelights_color[device_data.id].settings = settings;
        })
    })

    //TODO : resolve all yeelight bulbs color under their own device id during initialization instead for every seperate command
}