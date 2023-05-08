/* Globals. */
var watchlist       =    [];

/* Callbacks. ^^ */
document.getElementById ("attachBtn").onclick = (e) => {

    /* Get input values. */
    var apiKey  =   document.getElementById ("steamAPIKeyInput").value;
    var sID     =   document.getElementById ("steamIDInput").value;

    /* Aaaaand we scannnn! ^^ */
    attachSpy (apiKey, sID);

}

/* This is our starter function. Arguments: apiKey=YourSteamApiKey; sID=steamid64ofYourTarget*/
function attachSpy (apiKey, sID) {

    /* Setup timer */
    let ply = {

        "sID"               : sID,
        "gameCurrent"       : "",
        "gameOld"           : "",
        "ipOld"             : "",
        "ipCurrent"         : "",
        "oldPersonastate"   : "",
        "curPersonastate"   : "",
        "oldComNum"         :  0,
        "curComNum"         :  0

    };

    watchlist.push(ply);

    setInterval ((e) => { scan (apiKey) }, 5000);

}

/* This is the scanner that executes every 5 sec. A viable interval to not be ratelimited. */
function scan (apiKey, sID) {

    /* For everyone in the watchlist... */

    /* GetPlayerSummaries */
    for (const x of watchlist) {

        /* Comment Endpoint. */
        /* Fetch information -> handle it. */
        fetch (`https://steamcommunity.com/comment/Profile/render/${x.sID}/-1/?start=0`).then ((e) => {
            e.json().then (( (jsonData) => { handle ("Comments", x, jsonData) } ));
        });

        /* Summaries Endpoint. */
        let apiPoint = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${x.sID}`;

        /* Fetch information -> handle it. */
        fetch (apiPoint).then ((e) => {
            e.json().then (( (jsonData) => { handle ("GetPlayerSummaries", x, jsonData) } ));
        });

    }

}

function handle (type, x, apiRes) {

    /* Handle api response. */
    if (!apiRes) {return} else {
        
        /* Activity handler! */
        if (type == "Comments") {

            x.oldComNum = x.curComNum;
            x.curComNum = apiRes.total_count;

        }

        /* GetPlayerSummaries Handler. */
        if (type === "GetPlayerSummaries") {

            /* Check if the old details match the new ones. */
            x.gameOld = x.gameCurrent;
            x.gameCurrent = apiRes.response.players[0].gameextrainfo;

            x.oldPersonastate = x.curPersonastate;
            x.curPersonastate = apiRes.response.players[0].personastate;

            /* If the detail changed, log this. */
            if (x.curPersonastate != x.oldPersonastate || x.gameOld != x.gameCurrent || x.oldComNum != x.curComNum ) {
                
                /* Default to unknown. */
                let personastate = "unknown";

                /* Check Personastate */
                switch (apiRes.response.players[0].personastate) {

                    case 0:
                        personastate = "Offline";    
                        break;

                    case 1:
                        personastate = "Online";    
                        break;

                    case 2:
                        personastate = "Busy";    
                        break;

                    case 3:
                        personastate = "Away";    
                        break;

                    case 4:
                        personastate = "Snooze";    
                        break;

                    case 5:
                        personastate = "Looking for Trade";    
                        break;

                    case 6:
                        personastate = "Looking for Game";    
                        break;
            
                    default:
                    break;
                }

                /* Log data from ISteamUser. */
                x.name    =   apiRes.response.players[0].personaname;
                x.game    =   apiRes.response.players[0].gameextrainfo;
                x.locale  =   apiRes.response.players[0].loccountrycode;
                x.state   =   personastate;

                /* ISteamUser did something -> Send notif via zaphkiel. */
                let notifOptions = [`Activity >> ${x.name}`, `Game: ${x.game}\nCountry: ${x.locale}\nStatus: ${x.state}\nComments (Total): ${x.curComNum}`];
                new window.Notification(notifOptions[0], {body: notifOptions[1]});
            
            }
        
        }
    }
}