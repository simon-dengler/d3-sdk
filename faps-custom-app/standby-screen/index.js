// DRDoubleSDK is a global object loaded in by Electron in the Standby window and a "Trusted" Accessory window
if (!("DRDoubleSDK" in window)) {
	console.error("window.DRDoubleSDK not found. This is required.");
}

function q(selector) {
	return document.querySelector(selector);
}

function showGUI() {
	DRDoubleSDK.sendCommand('gui.accessoryWebView.show');
}

const jsonSpec = {
	  "url": "https://smarthome.faps.rrze.net/accessory-page",
	  "trusted": true,
	  "transparent": true,
	  "backgroundColor": "#FFF",
	  "hidden": false
  }
const endpointSettings = {
		"allowDisablingObstacleAvoidance": false,
		"disablePhoto": true,
		"hideVisitorPassButton": true,
		"defaultSpeakerVolume": 0.45,
		"disableApp_multiviewer": true,
		"disableApp_screensharing": true,
		"disableApp_webpage": true,
		"disableApp_text": true,
		"disableApp_satellite": true
}
var guiInterval;

DRDoubleSDK.on("event", (message) => {
	// Event messages include: { class: "DRNetwork", key: "info", data: {...} }
	switch (message.class + "." + message.key) {

		// DRNetwork
		case "DRNetwork.info": {
			q("#wifi_ssid").innerText = (message.data.connection == "connected" && message.data.ssid) ? message.data.ssid : "Unknown";
			q("#wifi_connected").innerText = (message.data.connection == "connected") ? 'Verbunden' : 'Getrennt';
			break;
		}
		// DRBase
		case "DRBase.status": {
			let bat_val = message.data.battery;
			q("#bat_val_percent").innerText = bat_val + ' %';
			let bat_val_nmbr = Number(bat_val);
			let source = "../img/bat100.png";
			if (message.data.charging) {
				source = "../img/bat_charging.png";
			} else {
				if (bat_val_nmbr < 90) {
					source = "../img/bat75.png";
					if (bat_val_nmbr < 75) {
						source = "../img/bat50.png";
						if(bat_val_nmbr < 50){
							source = "../img/bat25.png";
							if(bat_val_nmbr < 25){
								source = "../img/bat0.png";
							}
						}
					}
				}				
			}
			q("#bat_val_img").src = source;
			break;
		}
		// DREndpoint
		case "DREndpointModule.status": {
			q("#title").innerHTML = message.data.identity.robot.nickname;
			break;
		}
		case "DREndpointModule.sessionBegin": {
			DRDoubleSDK.sendCommand("gui.accessoryWebView.open", jsonSpec);
			guiInterval = window.setInterval(showGUI, 2000);
			break;
		}
		case "DREndpointModule.sessionEnd": {
			DRDoubleSDK.sendCommand("gui.accessoryWebView.close");
			clearInterval(guiInterval);
			DRDoubleSDK.sendCommand("mics.setBoost", { percent: 0.0 });
			DRDoubleSDK.sendCommand("base.kickstand.deploy");
			DRDoubleSDK.sendCommand("screensaver.prevent");
			break;
		}
		// DRMics
		case "DRMics.status": {
			q("#mic_value").innerText = message.data.boost == 0.0 ? 'AUS' : 'AN';
			break;
		}
		// DRAPI
		case "DRAPI.status": {
			// q("#cam_value").innerHTML = message.data.camera ? 'AN' : 'AUS';
			let cam_val = message.data.camera ? true : false;
			q('#cam_on').hidden = !cam_val;
			q('#cam_off').hidden = cam_val;
		}
	}
});
/*var cam_val = true;
function testGui() {
	cam_val = !cam_val;
	q('#cam_on').hidden = !cam_val;
	q('#cam_off').hidden = cam_val;
	q('#mic_on').hidden = !cam_val;
	q('#mic_off').hidden = cam_val;
	if(cam_val){
		q("#bat_val_img").src = "../img/bat25.png";
		q("#wifi_connected").innerText = "Nope";
		q("#bat_val_percent").innerText = "23%";
		q("#wifi_ssid").innerText = "NoNet";
	} else {
		q("#bat_val_img").src = "../img/bat_charging.png";
		q("#wifi_connected").innerText = "Yeesss";
		q("#bat_val_percent").innerText = "69%";
		q("#wifi_ssid").innerText = "SuperDuperNetz";
	}
}*/

function onConnect() {
	if (DRDoubleSDK.isConnected()) {
		DRDoubleSDK.resetWatchdog();

		// Subscribe to events that you will process. You can subscribe to more events at any time.
		DRDoubleSDK.sendCommand("events.subscribe", {
			events: [
				"DRBase.status",
				"DRNetwork.info",
				"DREndpointModule.status",
				"DREndpointModule.sessionBegin",
				"DREndpointModule.sessionEnd",
				"DRMics.status",
                "DRAPI.status",
			]
		});

		// Send commands any time – here, we're requesting initial info to show
		DRDoubleSDK.sendCommand("endpoint.setOptions", endpointSettings);
		DRDoubleSDK.sendCommand("mics.setBoost", { percent: 0.0 });
		DRDoubleSDK.sendCommand("network.requestInfo");
		DRDoubleSDK.sendCommand("base.requestStatus");
		DRDoubleSDK.sendCommand("endpoint.requestIdentity", { requestSetupLink: false });
		DRDoubleSDK.sendCommand("mics.requestStatus");
		DRDoubleSDK.sendCommand("api.requestStatus");
		DRDoubleSDK.sendCommand("screensaver.prevent");
		DRDoubleSDK.sendCommand("endpoint.enable");

	// debug
	q("#chargingDiv").style.backgroundColor = "blue";

	} else {
		window.setTimeout(onConnect, 100);
	}
}

window.onload = () => {
	// REQUIRED: Tell d3-api that we're still running ok (faster than every 3000 ms) or the page will be reloaded.
	window.setInterval(() => {
		DRDoubleSDK.resetWatchdog();
	}, 2000);

	// DRDoubleSDK 
	onConnect();
	DRDoubleSDK.on("connect", () => {
		onConnect();
	});

	DRDoubleSDK.on("disconnect", () => {
		DRDoubleSDK.sendCommand("endpoint.disable");
	});
};



