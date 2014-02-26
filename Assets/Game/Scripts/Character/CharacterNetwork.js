#pragma strict

public var networkPlayer: NetworkPlayer;
public var localPlayer: GameObject;
public var keyInventory : KeyInventory;
private var networkManager: NetworkManager;

function Start() {
    networkManager = GameObject.FindObjectOfType(NetworkManager);
}

function IsSinglePlayer(): boolean {
    return networkManager.IsSinglePlayer();
}

@RPC
function SetPlayerData( player: NetworkPlayer ) {
    networkPlayer = player;
    
    if(player == Network.player) {
        var controller = Component.FindObjectOfType(CharacterController);
        localPlayer = controller.gameObject;
        transform.parent = localPlayer.transform;
        transform.localPosition = Vector3.zero;
        transform.localEulerAngles = Vector3.zero;
    }
}

@RPC
function AddKeyServer( player: NetworkPlayer, color: int ) {
    networkPlayer = player;
    
    // do validation here
    
    networkView.RPC ("AddKeyClient", RPCMode.Others, player, color );
}

@RPC
function AddKeyClient( player: NetworkPlayer, color: int ) {
    networkPlayer = player;
    
    if(player == Network.player) {
        var networkChar = Component.FindObjectOfType(CharacterNetwork);
        networkChar.keyInventory.addKey(color);
    }
}

public function Die(position : Vector3, rotation : Quaternion, damage: int, attackerPos: Vector3) {
    SpawnRagdoll(position, rotation, damage, attackerPos);
    EnableDeathCam();
    keyInventory.clearKeys();
    Invoke("Respawn",5);
    
    var weapons = ComponentUtil.GetComponentInHierarchy(localPlayer,typeof(Weapons)) as Weapons;
    if ( weapons ) {
        weapons.ResetInventory();
    }
}

@RPC
public function DieRemote(networkPlayer: NetworkPlayer, position : Vector3, rotation : Quaternion, damage: int, attackerPos: Vector3) {
    // Only the server should be sending out the scoreboard updates.
    if(Network.isServer) {
        var scoreboardGO : GameObject = GameObject.Find("Scoreboard(Clone)");
        if(scoreboardGO != null) {
            var scoreboard : Scoreboard = scoreboardGO.GetComponent(Scoreboard);
            if(scoreboard != null) {
                scoreboard.AddDeath(networkPlayer);
            }
        }
    }
    
    Die(position, rotation, damage, attackerPos);
}

function Respawn() {
    if(Network.connections.Length > 0 && gameObject.networkView != null) {
        gameObject.networkView.RPC("DisableDeathCam",
                                    RPCMode.AllBuffered);
    }
    else {
        DisableDeathCam();
    }
}

function SpawnRagdoll(position : Vector3, rotation : Quaternion, damage: int, attackerPosition : Vector3) {
    DeadBodyManager.SpawnRagdoll(position, rotation, damage, attackerPosition);
}

function EnableDeathCam() {
    // Network players (and the local player) need to disable the character graphic while the character is dead.
    var renderers = transform.root.GetComponentsInChildren(Renderer);
    for(var renderIndex = 0; renderIndex < renderers.Length; renderIndex++) {
        var renderer : Renderer = renderers[renderIndex] as Renderer;
        renderer.enabled = false;
    }

}

@RPC
public function DisableDeathCam() {
    // The player who died needs to have his controls re-enabled.
    var deathCamTrans : Transform = transform.root.FindChild("DeathCamera(Clone)");
    if(deathCamTrans != null && deathCamTrans.gameObject.activeSelf) {
        var deathCam : PlayerDeathCamera = deathCamTrans.gameObject.GetComponent(PlayerDeathCamera);
        if(deathCam) {
            deathCam.Respawn();
        }
    }
    
    // All players need to re-enable the graphics for the player that died.
    var renderers = transform.root.GetComponentsInChildren(Renderer);
    for(var renderIndex = 0; renderIndex < renderers.Length; renderIndex++) {
        var renderer : Renderer = renderers[renderIndex] as Renderer;
        renderer.enabled = true;
    }
}

