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

        "sID"         : sID,
        "gameCurrent" : "",
        "gameOld"     : ""

    };

    watchlist.push(ply);
    setInterval ( (e) => { scan (apiKey) }, 5000);

}

/* This is the scanner that executes every 5 sec. A viable interval to not be ratelimited. */
function scan (apiKey, sID) {

    /* For everyone in the watchlist... */
    
    for (const x of watchlist) {

        /* Define endpoint */
        let apiPoint = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${x.sID}`;

        /* Fetch information -> handle it. */
        fetch (apiPoint).then ((e) => {
            e.json().then (( (jsonData) => { handle (x, jsonData) } ));
        });

    }

}

function handle (x, apiRes) {

    /* Handle api response. */
    if (!apiRes) {return} else {
        
        /* Check if the old details match the new ones. */
        x.gameOld = x.gameCurrent;
        x.gameCurrent = apiRes.response.players[0].gameextrainfo;

        /* If the detail changed, log this. */
        if (x.gameCurrent != x.gameOld) {

            let profile = {

                "name"    :   apiRes.response.players[0].personaname,
                "game"    :   apiRes.response.players[0].gameextrainfo,
                "locale"  :   apiRes.response.players[0].loccountrycode

            };

            let notifOptions = [`[Zaphkiel] Target: ${profile.name}`,`Game: ${profile.game}\nCountry: ${profile.locale}`];
            new window.Notification(notifOptions[0], {body: notifOptions[1]});
        }
    
    }
}