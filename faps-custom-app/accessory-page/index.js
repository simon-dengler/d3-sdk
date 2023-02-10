function q(q) { return document.querySelector(q); }

let consent = false;
function myFunction() {
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");}
    
function initScreen() {
    //q("#refuseMic").hidden = true;
    q("#confirm").hidden = true;
    q("#warning").hidden = true;
    refuseMic();
    allowSpeaker();
}

function allowMic() {
    consent = true;
    document.getElementById('allowMic').style.display = 'none';
    document.getElementById('refuseMic').style.display = 'inline';
    DRDoubleSDK.sendCommand("mics.setBoost", { percent: 0.25 });
    DRDoubleSDK.sendCommand("mics.requestStatus");
}

function refuseMic() {
    consent = false;
   document.getElementById('refuseMic').style.display = 'none';
   document.getElementById('allowMic').style.display = 'inline';
    
   //q("#refuseMic").hidden = true;
   //q("#allowMic").hidden = false;
    DRDoubleSDK.sendCommand("mics.setBoost", { percent: 0.0 });
    DRDoubleSDK.sendCommand("mics.requestStatus");
}

function refuseCam() {
    q("#refuseCam").hidden = true;
    q("#warning").hidden = false;
    window.setTimeout(showConfirm, 1500);
}

function showConfirm() {
    q("#confirm").hidden = false;
}

function confirm() {
    DRDoubleSDK.sendCommand("camera.disable");
    DRDoubleSDK.sendCommand("endpoint.session.end");
    q("#refuseCam").hidden = false;
    q("#warning").hidden = true;
    q("#confirm").hidden = true;
}

function muteSpeaker() {
    consent = false;
    document.getElementById('muteSpeaker').style.display = 'none';
    document.getElementById('allowSpeaker').style.display = 'inline';
    DRDoubleSDK.sendCommand("speaker.disable");
    // q("#muteSpeaker").hidden = true;
    //q("#allowSpeaker").hidden = false;

}


function allowSpeaker() {

    consent = true;
    document.getElementById('allowSpeaker').style.display = 'none';
    document.getElementById('muteSpeaker').style.display = 'inline';

    DRDoubleSDK.sendCommand("speaker.enable");
   // q("#allowSpeaker").hidden = true;
    //q("#muteSpeaker").hidden = false;
    //DRDoubleSDK.sendCommand("mics.setBoost", { percent: 0.25 });
    //DRDoubleSDK.sendCommand("mics.requestStatus");
}

if ("DRDoubleSDK" in window) {
    DRDoubleSDK.on("event", (message) => {
        switch (message.class + "." + message.key) {
            // case "DREndpointModule.messageFromDriverSidebar": {
            // 	if (message.data) {
            // 		handleMesage(message.data);
            // 	}
            // 	break;
            // }
            case "DRMics.status": {
                q("#micValue").innerHTML = (message.data.boost == 0.0) ? 'AUS' : 'AN';
                // Mikrofon soll standardmäßig ausgeschaltet sein 
                if (message.data.boost > 0.0 && !consent) {
                    DRDoubleSDK.sendCommand("mics.setBoost", { percent: 0.0 });
                    DRDoubleSDK.sendCommand("mics.requestStatus");
                }
                break;
            }
            case "DRAPI.status": {
                q("#camValue").innerHTML = message.data.camera ? 'AN' : 'AUS';
                q("#speakerValue").innerHTML = message.data.speaker ? 'AN' : 'AUS';
                break;
            }
        }
    });
    DRDoubleSDK.on("connect", () => {
        DRDoubleSDK.sendCommand("events.subscribe", {
            events: [
                "DREndpointModule.messageFromDriverSidebar",
                "DRMics.status",
                "DRAPI.status",
            ]
        });
        initScreen();
        DRDoubleSDK.sendCommand("mics.requestStatus");
        DRDoubleSDK.sendCommand("api.requestStatus");
    });

    

    
}