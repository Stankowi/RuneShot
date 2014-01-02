#pragma strict

var players = new Dictionary.<String,PlayerScore>();

public function AddDeath(player : NetworkPlayer) {
    var playerName : String = GetPlayerName(player);
    if(players.ContainsKey(playerName)) {
        players[playerName].deaths++;
        SendScoreUpdate(playerName);
    }
}

public function AddKill(player : NetworkPlayer) {
    var playerName : String = GetPlayerName(player);
    if(players.ContainsKey(playerName)) {
        players[playerName].kills++;
        SendScoreUpdate(playerName);
    }
}
function OnGUI() {
    var nameWidth = 120;
    var statsWidth = 60;

    GUILayout.BeginVertical(GUI.skin.box);
    GUILayout.Label("Scoreboard");
    GUILayout.BeginHorizontal(GUI.skin.box);
    GUILayout.Label("Name",GUILayout.Width(nameWidth));
    GUILayout.Label("Kills",GUILayout.Width(statsWidth));
    GUILayout.Label("Deaths",GUILayout.Width(statsWidth));
    GUILayout.EndHorizontal();
    var e = players.GetEnumerator();
    var guiColor : Color = GUI.color;
    while (e.MoveNext()) {
        // Draw disconnected players in a different color
        if(!e.Current.Value.connected) {
            GUI.color = new Color(0.8f,0.8f,0.8f,1.0f);
        }
        GUILayout.BeginHorizontal(GUI.skin.box);
        GUILayout.Label(e.Current.Key,GUILayout.Width(nameWidth));
        GUILayout.Label(e.Current.Value.kills.ToString(),GUILayout.Width(statsWidth));
        GUILayout.Label(e.Current.Value.deaths.ToString(),GUILayout.Width(statsWidth));
        GUILayout.EndHorizontal();
        GUI.color = guiColor;
    }
    GUILayout.EndVertical();

}

function GetPlayerName(player : NetworkPlayer) {
    return player.ipAddress + ":" + player.port;
}

function OnPlayerConnected(player: NetworkPlayer) {
    // When a player connects, send all players that new player's information
    networkView.RPC("UpdateScore",
                    RPCMode.AllBuffered,
                    GetPlayerName(player),
                    0,
                    0,
                    true);

    // Send the newly connected player the current scoreboard data
    var e = players.GetEnumerator();
    while (e.MoveNext()) {
        networkView.RPC("UpdateScore",
                        player,
                        e.Current.Key,
                        e.Current.Value.kills,
                        e.Current.Value.deaths,
                        e.Current.Value.connected
                    );
    }
    
}
    
function OnPlayerDisconnected(player: NetworkPlayer) {
    // When a player disconnects, tell all other players he is gone
    var playerName : String = GetPlayerName(player);
    if(players.ContainsKey(playerName)) {
        players[playerName].connected = false;
        SendScoreUpdate(playerName);
    }
}

function SendScoreUpdate(playerName : String) {
    if(players.ContainsKey(playerName)) {
        networkView.RPC("UpdateScore",
                        RPCMode.AllBuffered,
                        playerName,
                        players[playerName].kills,
                        players[playerName].deaths,
                        players[playerName].connected
                    );
    }
}

@RPC
function UpdateScore(player : String, kills : int, deaths : int, connected : boolean) {
    if(!players.ContainsKey(player)) {
        players.Add(player,new PlayerScore());
    }
    players[player].kills = kills;
    players[player].deaths = deaths;
    players[player].connected = connected;
}
