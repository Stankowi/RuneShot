#pragma strict

var players = new Dictionary.<String,PlayerScore>();
var rabbitFlagImage: Texture2D = Resources.Load("Game Modes/Rabbit/rabbitFlagIndicator-small", Texture2D);

public function AddDeath(player : NetworkPlayer) {
    var playerName : String = GetPlayerName(player);
    if(players.ContainsKey(playerName)) {
    	Debug.Log("Adding death to player " + playerName);
        players[playerName].deaths++;
        SendScoreUpdate(playerName);
    }
}

public function AddKill(player : NetworkPlayer) {
    var playerName : String = GetPlayerName(player);
    if(players.ContainsKey(playerName)) {
    	Debug.Log("Adding kill to player " + playerName);
        players[playerName].kills++;
        SendScoreUpdate(playerName);
    }
}

public function RemoveKill(player : NetworkPlayer) {
    var playerName : String = GetPlayerName(player);
    if(players.ContainsKey(playerName)) {
    	Debug.Log("Removing kill from player " + playerName);
        players[playerName].kills--;
        SendScoreUpdate(playerName);
    }
}

public function GetDisplayName(player : NetworkPlayer){
    var playerName : String = GetPlayerName(player);
    if(players.ContainsKey(playerName)) {
        return players[playerName].displayName;
    }
}

public function ChangeFlagState(player : NetworkPlayer, hasFlag : boolean) {
	var playerName : String = GetPlayerName(player);
	if(players.ContainsKey(playerName)) {
		players[playerName].isRabbit = hasFlag;
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
    GUILayout.Label("Score",GUILayout.Width(statsWidth));
    GUILayout.Label("RBT?",GUILayout.Width(statsWidth));
    GUILayout.EndHorizontal();
    var e = players.GetEnumerator();
    var guiColor : Color = GUI.color;
    while (e.MoveNext()) {
        // Draw disconnected players in a different color
        if(!e.Current.Value.connected) {
            GUI.color = new Color(0.8f,0.8f,0.8f,1.0f);
        }
        GUILayout.BeginHorizontal(GUI.skin.box);
        GUILayout.Label(e.Current.Value.displayName,GUILayout.Width(nameWidth));
        GUILayout.Label(e.Current.Value.kills.ToString(),GUILayout.Width(statsWidth));
        GUILayout.Label(e.Current.Value.deaths.ToString(),GUILayout.Width(statsWidth));
        GUILayout.Label(e.Current.Value.score.ToString(),GUILayout.Width(statsWidth));
        if(e.Current.Value.isRabbit) {
        	GUILayout.Label(rabbitFlagImage,GUILayout.ExpandWidth(false),GUILayout.ExpandHeight(false),GUILayout.MaxWidth(25.0f),GUILayout.MaxHeight(25.0f));
        } else {
        	GUILayout.Label("");
        }
        
        GUILayout.EndHorizontal();
        GUI.color = guiColor;
    }
    GUILayout.EndVertical();

}

function GetPlayerName(player : NetworkPlayer) {
	Debug.Log(player.ipAddress + ":" + player.port + ":" + player);
    return player.ipAddress + ":" + player.port + ":" + player;
}

function OnPlayerConnected(player: NetworkPlayer) {
    // When a player connects, send all players that new player's information
    SendPlayerInformationToOthers(GetPlayerName(player), GetPlayerName(player));

    // Send the newly connected player the current scoreboard data
    var e = players.GetEnumerator();
    while (e.MoveNext()) {
        networkView.RPC("UpdateScore",
                        player,
                        e.Current.Key,
                        e.Current.Value.displayName,
                        e.Current.Value.kills,
                        e.Current.Value.deaths,
                        e.Current.Value.score,
                        e.Current.Value.isRabbit,
                        e.Current.Value.connected
                    );
    }
    
}

function SendPlayerInformationToOthers(player: String, displayName: String){
    networkView.RPC("UpdateScore",
                    RPCMode.AllBuffered,
                    player,
                    displayName,
                    0,
                    0,
                    0,
                    false,
                    true);
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
                        players[playerName].displayName,
                        players[playerName].kills,
                        players[playerName].deaths,
                        players[playerName].score,
                        players[playerName].isRabbit,
                        players[playerName].connected
                    );
    }
}

@RPC
function UpdateScore(player : String, displayName : String, kills : int, deaths : int, score : int, isRabbit : boolean, connected : boolean) {
    if(!players.ContainsKey(player)) {
    	Debug.Log("Adding new player with key: " + player);
        players.Add(player,new PlayerScore());
    }
    players[player].displayName = displayName;
    players[player].kills = kills;
    players[player].deaths = deaths;
    players[player].score = score;
    players[player].isRabbit = isRabbit;
    players[player].connected = connected;
}
