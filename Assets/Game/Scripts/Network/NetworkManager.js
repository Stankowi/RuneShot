
// needs to be a globally (globe -> earth) unique name for this game
var gameName: String = "2013 RuneShot Game Jam";


private var hostData: HostData[];
private var refreshing: boolean;
private var isInitialized: boolean;
private var isSinglePlayer: boolean;
private var playerSpawnPoints: CharacterSpawnPoint[];
private var playerName: String;
private var hostname: String = "localhost";
private var hostport: String = "25000";
private var isServerInitialized: boolean;
//private var enemyList: 
//
// public helper functions
//

function IsInitialized() : boolean {

    return isInitialized;
}

function IsSinglePlayer(): boolean {

    return isSinglePlayer;
}

//
// Initialization and Setup functions
//

function Start () {
    
    playerSpawnPoints = GameObject.FindObjectsOfType(CharacterSpawnPoint);
    
    playerName = PlayerPrefs.GetString("Player Name", System.Environment.UserName);
}

function Update () {

    // check to see if we're waiting for the servers list
    updateCheckRefreshing();
    if (isServerInitialized) {
        updateGameLoop();
    }
}

function updateGameLoop()
{
    
}

function OnGUI() {

    if( !isInitialized ) {
        var y: int = 10;
        
        GUI.Label(Rect(20, y, 100, 20), "Player Name:");
        var newName: String = GUI.TextField(Rect(120, y, 200, 20), playerName, 24);
        
        if( newName != playerName ) {
            playerName = newName;
            PlayerPrefs.SetString("Player Name", playerName);
        }
        
        y += 30;
        if( GUI.Button(Rect(10, y, 100, 30), "Single Player") ) {
            isInitialized = true;
            isSinglePlayer = true;
            startSinglePlayer();
        }
    
        y += 40;
        if( GUI.Button(Rect(10, y, 100, 30), "Start Server") ) {
            isInitialized = true;
            isSinglePlayer = false;
            startServer();
        }
    
        y += 40;
        if( GUI.Button(Rect(10, y, 100, 30), "Connect To:") ) {
            isInitialized = true;
            isSinglePlayer = false;
            connectToServer( hostname, int.Parse(hostport) );
        }
        
        hostname = GUI.TextField(Rect(120, y+5, 200, 20), hostname, 24);
        hostport = GUI.TextField(Rect(340, y+5, 50, 20), hostport, 5);

        y += 40;
        if( GUI.Button(Rect(10, y, 100, 30), "List Servers") ) {
            refreshHostList();
        }
        
        if( hostData ) {    
            for( var i:int = 0; i < hostData.length; i++ ) {
                y += 40;
                if( GUI.Button(Rect(10, y, 300, 30), hostData[i].gameName) ) {
                    isInitialized = true;                    
                    isSinglePlayer = false;
                    var tmpIp : String = hostData[i].ip[0];
                    for(var j : int = 1; j < hostData[i].ip.Length; j++) {
                        tmpIp = "." + hostData[i].ip[j];
                    }
                    connectToServer( tmpIp, hostData[i].port );
                }
            }
        }
    }
}

function refreshHostList() {

    MasterServer.RequestHostList(gameName);
    refreshing = true;
}

function updateCheckRefreshing() {

    if( !IsInitialized() && refreshing && MasterServer.PollHostList().Length > 0 ) {
        
        refreshing = false;
        hostData = MasterServer.PollHostList();
    }  
}

function reset() {

    hostData = null;
    isInitialized = false;
    isSinglePlayer = true;
}

//
// Server functions
//

// Starts this simulation as the Authoratative Server
function startServer() {

    // start listenening for connections
    Network.InitializeServer(32, 25000, !Network.HavePublicAddress);
    
    // notify the Unity Global Service about me
    MasterServer.RegisterHost(gameName, System.Environment.MachineName + " - " + playerName, "Game Jam");
}

function OnServerInitialized() {

    Debug.Log("Server Initialized");
    
    InitializeServerSystems();
}

function OnPlayerConnected( player: NetworkPlayer ) {
    Debug.Log("Player connected from " + player.ipAddress + ":" + player.port);
    SpawnServerCharacter(player);
}

function SpawnServerCharacter(player: NetworkPlayer) {

    var chrServer: GameObject = GameObject.Instantiate(Resources.Load("Characters/CharacterServer",GameObject),
                                                Vector3.zero,
                                                Quaternion.identity);
    
    var chrNetwork: GameObject = NetworkUtil.Instantiate(Resources.Load("Characters/CharacterNetwork",GameObject),
                                                Vector3.zero,
                                                Quaternion.identity,
                                                NetworkGroup.CharacterNetwork);
    chrNetwork.transform.parent = chrServer.transform;
    
    if(Network.connections.Length > 0) {
        chrNetwork.networkView.RPC("SetPlayerData", RPCMode.AllBuffered, player);
    }
    else {    
        var cn: CharacterNetwork = chrNetwork.GetComponent(CharacterNetwork) as CharacterNetwork;
        cn.SetPlayerData(player);
    }

}

function OnPlayerDisconnected( player: NetworkPlayer ) {

    Debug.Log("Clean up after player " +  player);
    Network.RemoveRPCs(player);
    Network.DestroyPlayerObjects(player);
}

// This is the location where game systems should add area initializtion hooks
function InitializeServerSystems() {
    isServerInitialized = true;
}
       
//
// Client functions
//

// connects as a Client to the specified Server
function connectToServer( hostname: String, port: int ) {

    var username = playerName.Trim();
    
    if( username.Length < 1 ) {
        username = System.Environment.UserName;
    }
    
    if( username != playerName ) {
        playerName = username;
        PlayerPrefs.SetString("Player Name", playerName);
    }

    Network.Connect( hostname, port );
}

function OnConnectedToServer() {

    getSpawnPoint().spawnCharacter(true);
}

function OnDisconnectedFromServer(info: NetworkDisconnection) {

    Debug.Log("Disconnected: " + info);
    
    reset();
}

function OnFailedToConnect( error: NetworkConnectionError ) {

    Debug.Log("Failed to connect: " + error);
    
    reset();
}

//
// Singleplayer functions
//

function startSinglePlayer() {
    
    getSpawnPoint().spawnCharacter(false);
    SpawnServerCharacter(Network.player);
    isServerInitialized = true;
}

//
// Utility functions
//

private function getSpawnPoint(): CharacterSpawnPoint {

    return playerSpawnPoints[ Random.Range(0, playerSpawnPoints.length) ];
}

function IsMyPlayerCharacter(player: PlayerCharacter): boolean {

    return player != null && (IsSinglePlayer() || player.networkView.isMine);
}


