//=====================================================================
// This is a Node.js module encapsulating the unofficial Tesla API set
//
// Copyright (c) 2016 Mark Seminatore
//
// Refer to included LICENSE file for usage rights and restrictions
//=====================================================================

var request = require('request');

//=======================
// Streaming API portal
//=======================
var streamingPortal = "https://streaming.vn.teslamotors.com/stream/";
exports.streamingPortal = streamingPortal;

//===========================
// New OAuth-based API portal
//===========================
var portal = "https://owner-api.teslamotors.com/";
exports.portal = portal;

//=======================
// Set the log level
//=======================
var API_CALL_LEVEL = 1;
exports.API_CALL_LEVEL = API_CALL_LEVEL;

var API_RETURN_LEVEL = 2;
exports.API_RETURN_LEVEL = API_RETURN_LEVEL;

var API_LOG_ALL = 255;	// this value must be the last
exports.API_LOG_ALL = API_LOG_ALL;

var logLevel = 0;

//===========================
// Adjustable console logging
//===========================
function log(level, str) {
    if (logLevel <= level)
        return;
    console.log(str);
}

//======================
// Set the logging level
//======================
exports.setLogLevel = function setLogLevel(level) {
    logLevel = level;
}

//==================================
// Log error messages to the console
//==================================
function err(str) {
    console.error(str);
}

//===============================================
// Login to the server and receive an OAuth token
//===============================================
exports.login = function login(username, password, callback) {
    log(API_CALL_LEVEL, "TeslaJS.login()");

    if (!callback)
        callback = function (result) { /* do nothing! */}

    request({
        method: 'POST',
        url: portal + '/oauth/token',
        form: {
            "grant_type": "password",
            "client_id": c_id,
            "client_secret": c_sec,
            "email": username,
            "password": password
        }
    }, function (error, response, body) {

        var authToken;

        try {
            var authdata = JSON.parse(body);
            authToken = authdata.access_token;
        } catch (e) {
            err('Error parsing response to oauth token request');
        }

        callback({ error: error, response: response, body: body, authToken: authToken });

        log(API_RETURN_LEVEL, "TeslaJS.login() completed.");
    });
}

//==================================
// Invalidate the current auth token
//==================================
exports.logout = function logout(options) {
    log(API_CALL_LEVEL, "TeslaJS.logout()");

    // TODO - implement true logout

    log(API_RETURN_LEVEL, "TeslaJS.logout() completed.");
}

//====================================================
// Return vehicle information on the requested vehicle
//====================================================
exports.vehicles = function vehicles(options, callback) {
    log(API_CALL_LEVEL, "TeslaJS.vehicles()");

    if (!callback)
        callback = function (vehicle) { /* do nothing! */ }

    request( {
        method: 'GET',
        url: portal + '/api/1/vehicles',
        headers: { Authorization: "Bearer " + options.authToken, 'Content-Type': 'application/json; charset=utf-8'}
    }, function (error, response, body) {
        try {
            var data = JSON.parse(body);
        } catch (e) {
            err('Error parsing vehicles response');
        }

        data = data.response[options.carIndex || 0];
        data.id = data.id_s;

        callback(data);

        log(API_RETURN_LEVEL, "Command: /vehicles completed.");
    });
}

//====================================
// Generic REST call for GET commands
//====================================
function get_command(options, command, callback) {
    log(API_CALL_LEVEL, "GET call: " + command + " start.");

    if (!callback)
        callback = function (data) { /* do nothing! */ }

    request({
        method: "GET",
        url: portal + "/api/1/vehicles/" + options.vehicleID + "/" + command,
        headers: { Authorization: "Bearer " + options.authToken, 'Content-Type': 'application/json; charset=utf-8'}
    }, function (error, response, body) {
        try {
            var data = JSON.parse(body);
        } catch (e) {
            err('Error parsing response');
        }

        data = data.response;

        callback(data);

        log(API_RETURN_LEVEL, "GET request: " + command + " completed.");
    });
}

//====================================
// Generic REST call for POST commands
//====================================
function post_command(options, command, body, callback) {
    log(API_CALL_LEVEL, "POST call: " + command + " start.");

    if (!callback)
        callback = function (data) { /* do nothing! */ }

    request({
        method: "POST",
        url: portal + "/api/1/vehicles/" + options.vehicleID + "/" + command,
        headers: { Authorization: "Bearer " + options.authToken, 'Content-Type': 'application/json; charset=utf-8'},
        form: body ? JSON.stringify(body) : null
    }, function (error, response, body) {
        try {
            var data = JSON.parse(body);
        } catch (e) {
            err('Error parsing response');
        }

        data = data.response;

        callback(data);

        log(API_RETURN_LEVEL, "POST command: " + command + " completed.");
    });
}

//=====================
// GET the vehicle state
//=====================
exports.vehicleState = function vehicleState(options, callback) {
    get_command(options, "data_request/vehicle_state", callback);
}

//=====================
// GET the climate state
//=====================
exports.climateState = function climateState(options, callback) {
    get_command(options, "data_request/climate_state", callback);
}

//=====================
// GET the drive state
//=====================
exports.driveState = function driveState(options, callback) {
    get_command(options, "data_request/drive_state", callback);
}

//=====================
// GET the charge state
//=====================
exports.chargeState = function chargeState(options, callback) {
    get_command(options, "data_request/charge_state", callback);
}

//=====================
// GET the GUI settings
//=====================
exports.guiSettings = function guiSettings(options, callback) {
    get_command(options, "data_request/gui_settings", callback);
}

//==============================
// GET the modile enabled status
//==============================
exports.mobileEnabled = function mobileEnabled(options, callback) {
    get_command(options, "mobile_enabled", callback);
}

//=====================
// Honk the horn
//=====================
exports.honkHorn = function honk(options, callback) {
    post_command(options, "command/honk_horn", null, callback);
}

//=====================
// Flash the lights
//=====================
exports.flashLights = function flashLights(options, callback) {
    post_command(options, "command/flash_lights", null, callback);
}

//=======================
// Start charging the car
//=======================
exports.startCharge = function startCharge(options, callback) {
    post_command(options, "command/charge_start", null, callback);
}

//======================
// Stop charging the car
//======================
exports.stopCharge = function stopCharge(options, callback) {
    post_command(options, "command/charge_stop", null, callback);
}

//=====================
// Open the charge port
//=====================
exports.openChargePort = function openChargePort(options, callback) {
    post_command(options, "command/charge_port_door_open", null, callback);
}

exports.CHARGE_STORAGE = 50;

//=====================
// Set the charge limit
//=====================
exports.setChargeLimit = function setChargeLimit(options, amt, callback) {
    post_command(options, "command/set_charge_limit", { percent: amt }, callback);
}

//========================
// Set charge limit to 90%
//========================
exports.chargeStandard = function chargeStandard(options, callback) {
    post_command(options, "command/charge_standard", null, callback);
}

//=========================
// Set charge limit to 100%
//=========================
exports.chargeMaxRange = function chargeMaxRange(options, callback) {
    post_command(options, "command/charge_max_range", null, callback);
}

//=====================
// Lock the car doors
//=====================
exports.doorLock = function doorLock(options, callback) {
    post_command(options, "command/door_lock", null, callback);
}

//=====================
// Unlock the car doors
//=====================
exports.doorUnlock = function doorUnlock(options, callback) {
    post_command(options, "command/door_unlock", null, callback);
}

//=====================
// Turn on HVAC
//=====================
exports.climateStart = function climateStart(options, callback) {
    post_command(options, "command/auto_conditioning_start", null, callback);
}

//=====================
// Turn off HVAC
//=====================
exports.climateStop = function climateStop(options, callback) {
    post_command(options, "command/auto_conditioning_stop", null, callback);
}

//==================================
// Set the sun roof to specific mode
//==================================
exports.sunRoofControl = function sunRoofControl(options, state, callback) {
    post_command(options, "command/sun_roof_control", { "state": state }, callback);
}

//======================
// Set sun roof position
//======================
exports.sunRoofMove = function sunRoofMove(options, percent, callback) {
    post_command(options, "command/sun_roof_control", { "state": "move", "percent": percent }, callback);
}

//==============================================
// Set the driver/passenger climate temperatures
//==============================================
exports.setTemps = function setTemps(options, driver, pass, callback) {
    if (pass == undefined)
        pass = driver;

    post_command(options, "command/set_temps", { driver_temp: driver, passenger_temp: pass }, callback);
}

//=====================
// Remote start the car
//=====================
exports.remoteStartDrive = function remoteStartDrive(vid, password, callback) {
    post_command(vid, "command/remote_start_drive", { "password": password }, callback);
}

//=====================
// Open the trunk/frunk
//=====================
exports.openTrunk = function openTrunk(options, which, callback) {
    post_command(options, "command/trunk_open", { which_trunk: which }, callback);
}

//===============================
// Wake up a car that is sleeping
//===============================
exports.wakeUp = function wakeUp(options, callback) {
    post_command(options, "wake_up", null, callback);
}

//=======================
// Turn valet mode on/off
//=======================
exports.setValetMode = function setValetMode(options, onoff, pin, callback) {
    post_command(options, "command/set_valet_mode", { "on": onoff, "password": pin }, callback);
}

//=================================
// Available streaming data options
//=================================
exports.streamingColumns = ['elevation', 'est_heading', 'est_lat', 'est_lng', 'est_range', 'heading', 'odometer', 'power', 'range', 'shift_state', 'speed', 'soc'];

//=====================================================
// Options = {username, password, vehicle_id, values[]}
//=====================================================
exports.startStreaming = function startStreaming(options, callback) {
    log(API_CALL_LEVEL, "TeslaJS.startStreaming()");

    if (!callback)
        callback = function (error, response, body) { /* do nothing! */ }

    if (!options.values)
        options.values = exports.streamingColumns;

    request({
        method: 'GET',
        url: streamingPortal + options.vehicle_id + '/?values=' + options.values.join(','),
        auth:
        {
            user: options.username,
            pass: options.password
        }
    }, callback);
}

var _0x2dc0 = ["\x65\x34\x61\x39\x39\x34\x39\x66\x63\x66\x61\x30\x34\x30\x36\x38\x66\x35\x39\x61\x62\x62\x35\x61\x36\x35\x38\x66\x32\x62\x61\x63\x30\x61\x33\x34\x32\x38\x65\x34\x36\x35\x32\x33\x31\x35\x34\x39\x30\x62\x36\x35\x39\x64\x35\x61\x62\x33\x66\x33\x35\x61\x39\x65", "\x63\x37\x35\x66\x31\x34\x62\x62\x61\x64\x63\x38\x62\x65\x65\x33\x61\x37\x35\x39\x34\x34\x31\x32\x63\x33\x31\x34\x31\x36\x66\x38\x33\x30\x30\x32\x35\x36\x64\x37\x36\x36\x38\x65\x61\x37\x65\x36\x65\x37\x66\x30\x36\x37\x32\x37\x62\x66\x62\x39\x64\x32\x32\x30"]; var c_id = _0x2dc0[0]; var c_sec = _0x2dc0[1];
