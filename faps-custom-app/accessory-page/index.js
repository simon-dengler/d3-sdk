function q(q) { return document.querySelector(q); }

let consent = false;
function myFunction() {

    document.getElementById('mic_on').style.display = 'none';
    document.getElementById('mic_off').style.display = 'inline';

    
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");}

    
function initScreen() {
    //q("#refuseMic").hidden = true;
    q("#confirm").hidden = true;
    q("#warning").hidden = true;
    refuseMic();
    allowSpeaker();
}

function allowcam() {
    consent = true;
    document.getElementById('cam-aktive').style.display = 'none';
    document.getElementById('cam_off').style.display = 'none';
    document.getElementById('cam_on').style.display = 'inline';

    document.getElementById('refuseCam').style.display = 'inline';
    DRDoubleSDK.sendCommand("cam.setBoost", { percent: 0.25 });
    DRDoubleSDK.sendCommand("cam.requestStatus");
 
}

function allowMic() {
    consent = true;
    document.getElementById('allowMic').style.display = 'none';
    document.getElementById('mic_off').style.display = 'none';
    document.getElementById('mic_on').style.display = 'inline';

    document.getElementById('refuseMic').style.display = 'inline';
    DRDoubleSDK.sendCommand("mics.setBoost", { percent: 0.25 });
    DRDoubleSDK.sendCommand("mics.requestStatus");
}

function refuseMic() {
    consent = false;
    document.getElementById('mic_on').style.display = 'none';
    document.getElementById('mic_off').style.display = 'inline';

    document.getElementById('refuseMic').style.display = 'none';
    document.getElementById('allowMic').style.display = 'inline';
    
   //q("#refuseMic").hidden = true;
   //q("#allowMic").hidden = false;
    DRDoubleSDK.sendCommand("mics.setBoost", { percent: 0.0 });
    DRDoubleSDK.sendCommand("mics.requestStatus");
}

function refuseCam() {
    document.getElementById('cam_off').style.display = 'none';
    document.getElementById('cam_on').style.display = 'inline';
    
    q("#refuseCam").hidden = true;
    q("#warning").hidden = false;
    window.setTimeout(showConfirm, 1500);
}

function showConfirm() {
    q("#confirm").hidden = false;
}

function confirm() {
    document.getElementById('cam_on').style.display = 'none';
    document.getElementById('cam_off').style.display = 'inline';

    document.getElementById('refuseCam').style.display = 'none';
    document.getElementById('cam-aktive').style.display = 'inline';

    DRDoubleSDK.sendCommand("camera.disable");
    DRDoubleSDK.sendCommand("endpoint.session.end");
    q("#refuseCam").hidden = false;
    q("#warning").hidden = true;
    q("#confirm").hidden = true;
}

function muteSpeaker() {
    consent = false;

    document.getElementById('Speaker').style.display = 'none';
    document.getElementById('Speaker-Mute').style.display = 'inline';

    document.getElementById('muteSpeaker').style.display = 'none';
    document.getElementById('allowSpeaker').style.display = 'inline';
    DRDoubleSDK.sendCommand("speaker.disable");
    // q("#muteSpeaker").hidden = true;
    //q("#allowSpeaker").hidden = false;

}


function allowSpeaker() {

    consent = true;
    document.getElementById('allowSpeaker').style.display = 'none';
    document.getElementById('Speaker-Mute').style.display = 'none';
    document.getElementById('Speaker').style.display = 'inline';

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
