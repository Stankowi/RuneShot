
// needs to be a globally (globe -> earth) unique name for this game
var gameName: String = "2013 RuneShot Game Jam";
var maxNPCs: int = 8;
var minSpawnTime: float = 4.0f;
var maxSpawnTime: float = 8.0f;

private var hostData: HostData[];
private var refreshing: boolean;
private var isInitialized: boolean;
private var isSinglePlayer: boolean;
private var playerSpawnPoints: CharacterSpawnPoint[];
private var npcSpawnPoints: NPCSpawnPoint[];
private var playerName: String;
private var hostname: String = "localhost";
private var hostport: String = "25000";
private var isServerInitialized: boolean;
private var scoreboard: GameObject = null;
private var enemyList: Array = new Array();
private var enemySpawnTimer: float = 0.0f;
private var firstSpawn: boolean = false;

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
    npcSpawnPoints = GameObject.FindObjectsOfType(NPCSpawnPoint);
    playerName = PlayerPrefs.GetString("Player Name", System.Environment.UserName);
}

function Update () {

    // check to see if we're waiting for the servers list
    updateCheckRefreshing();
    if (isServerInitialized) {
    	if (isSinglePlayer) {
        	updateGameLoop();
        }
    }
}

function updateGameLoop()
{
    if (enemyList.Count < maxNPCs) {
        if (!firstSpawn)
        {
            firstSpawn = true;
            
            var n = maxNPCs;
            if (n > npcSpawnPoints.Length)
                n = npcSpawnPoints.Length;
            
            for (i = 0; i < n; ++ i) {
                enemyList.Push(npcSpawnPoints[i].spawnNPC(true));
            }
            enemySpawnTimer = Random.Range(minSpawnTime, maxSpawnTime);
        }     
        else {
            enemySpawnTimer -= Time.deltaTime;
            if (enemySpawnTimer <= 0.0f) {
                // spawn an enemy
                enemyList.Push(getNPCSpawnPoint().spawnNPC(true));
                enemySpawnTimer = Random.Range(minSpawnTime, maxSpawnTime);
            }
        }
    }
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
    // Spawning the scoreboard on the first player connecting
    // fixes an odd race condition where the network spawned object wouldn't propegate correctly
    // when it was created before a character was connected.
    if(scoreboard == null) {
        SpawnScoreboard(player);
    }
    
    Debug.Log("Player connected from " + player.ipAddress + ":" + player.port);
    SpawnServerCharacter(player);

    //Get DisplayName for Player
    networkView.RPC("SendOutDisplayName",
                player
                );   
    
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

function SpawnScoreboard(player) {
    scoreboard = NetworkUtil.Instantiate(Resources.Load("UI/Scoreboard",GameObject),
                                                Vector3.zero,
                                                Quaternion.identity,
                                                NetworkGroup.Scoreboard);
    if(player != null) {
        var score : Scoreboard = scoreboard.GetComponent(Scoreboard);
        score.OnPlayerConnected(player);
    }
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

@RPC
function SendOutDisplayName() { //scoreboard : GameObject){
    var scoreboard : GameObject = GameObject.Find("Scoreboard(Clone)");
    if(scoreboard != null){
        var score : Scoreboard = scoreboard.GetComponent(Scoreboard);
        if(score != null){       
            var networkPlayerName = Network.player.externalIP + ":" + Network.player.externalPort + ":" + Network.player;
            score.SendPlayerInformationToOthers(networkPlayerName, playerName);
        }
    }
}

function OnConnectedToServer() {

    getCharacterSpawnPoint().spawnCharacter(true);
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
    
    getCharacterSpawnPoint().spawnCharacter(false);
    SpawnServerCharacter(Network.player);
    SpawnScoreboard(null);
    isServerInitialized = true;
}

function OnNPCDeath(npc: GameObject) {
    for (i = 0; i < enemyList.Count; ++ i) {
        if (enemyList[i] == npc) {
            enemyList.RemoveAt(i);
            break;
        }
    }
}

//
// Utility functions
//

private function getCharacterSpawnPoint(): CharacterSpawnPoint {

    return playerSpawnPoints[ Random.Range(0, playerSpawnPoints.length) ];
}

private function getNPCSpawnPoint(): NPCSpawnPoint {

    return npcSpawnPoints[ Random.Range(0, npcSpawnPoints.length) ];
}

function IsMyPlayerCharacter(player: PlayerCharacter): boolean {

    return player != null && (IsSinglePlayer() || player.networkView.isMine);
}


