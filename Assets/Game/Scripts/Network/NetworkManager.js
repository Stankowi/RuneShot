
// needs to be a globally (globe -> earth) unique name for this game
var gameName: String = "2013 RuneShot Game Jam";


private var hostData: HostData[];
private var refreshing: boolean;
private var isInitialized: boolean;
private var isSinglePlayer: boolean;
private var playerSpawnPoints: CharacterSpawnPoint[];

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
    
    playerPrefab = Resources.Load("Characters/PlayerCharacter", GameObject);
    charModelPrefab = Resources.Load("Characters/CharacterGraphics", GameObject);
    
    playerSpawnPoints = GameObject.FindObjectsOfType(CharacterSpawnPoint);
}

function Update () {

    // check to see if we're waiting for the servers list
    updateCheckRefreshing();
}

function OnGUI() {

    if( !isInitialized ) {
        
        if( GUI.Button(Rect(10, 10, 100, 30), "Single Player") ) {
            isInitialized = true;
            isSinglePlayer = true;
            startSinglePlayer();
        }
    
        if( GUI.Button(Rect(10, 50, 100, 30), "Start Server") ) {
            isInitialized = true;
            isSinglePlayer = false;
            startServer();
        }

        if( GUI.Button(Rect(10, 90, 100, 30), "List Servers") ) {
            refreshHostList();
        }
        
        if( hostData ) {    
            for( var i:int = 0; i < hostData.length; i++ ) {
                if( GUI.Button(Rect(10, 130 + (40*i), 300, 30), hostData[i].gameName) ) {
                    isInitialized = true;                    
                    isSinglePlayer = false;
                    connectToServer( hostData[i] );
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
    MasterServer.RegisterHost(gameName, System.Environment.MachineName, "Game Jam");
}

function OnServerInitialized() {

    Debug.Log("Server Initialized");
}

function OnPlayerConnected( player: NetworkPlayer ) {

    Debug.Log("Player connected from " + player.ipAddress + ":" + player.port);

}

function OnPlayerDisconnected( player: NetworkPlayer ) {

    Debug.Log("Clean up after player " +  player);
    Network.RemoveRPCs(player);
    Network.DestroyPlayerObjects(player);
}
    
//
// Client functions
//

// connects as a Client to the specified Server
function connectToServer( host: HostData ) {
    
    Network.Connect( host );
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
}

//
// Utility functions
//

function getSpawnPoint(): CharacterSpawnPoint {

    return playerSpawnPoints[ Random.Range(0, playerSpawnPoints.length) ];
}

