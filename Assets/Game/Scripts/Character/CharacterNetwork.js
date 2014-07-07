#pragma strict

public var networkPlayer: NetworkPlayer;
public var localPlayer: GameObject;
public var keyInventory : KeyInventory;
public var characterStatusEffect : CharacterStatusEffect;
private var networkManager: NetworkManager;
private var showKiller = false;
private var lastKilledBy = "unknown";

function Start() {
    networkManager = GameObject.FindObjectOfType(NetworkManager);
}

function IsSinglePlayer(): boolean {
    return networkManager.IsSinglePlayer();
}

function OnGUI () {
    if(showKiller){
        var style = GUIStyle();
        style.fontSize = 50;
        style.normal.textColor = Color.red;
        style.alignment = TextAnchor.MiddleCenter;
        //GUI.contentColor = Color.red;    
        
        GUI.Box(Rect(Screen.width/2,Screen.height/2,0,30),"Killed by: " + lastKilledBy, style);
        GUI.enabled = true;
    } else {
        GUI.enabled = false;
    }
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
        for(var c:CharacterNetwork in Component.FindObjectsOfType(CharacterNetwork))
        {
            if(c.networkPlayer == player)
            {
                //var networkChar = Component.FindObjectOfType(CharacterNetwork);
                //networkChar.keyInventory.addKey(color);
                c.keyInventory.addKey(color);
            }
        }
    }
}

@RPC
public function SetLastKilledBy(killer: String){
    lastKilledBy = killer;
}

public function Die(position : Vector3, rotation : Quaternion, damage: int, attackerPos: Vector3) {
    var vehicle : Vehicle = ComponentUtil.GetComponentInHierarchy(gameObject, Vehicle);
    if (vehicle) {
    	var subChar = ComponentUtil.GetComponentInHierarchy(gameObject,CharacterServerSide) as CharacterServerSide;
    	if (subChar) {
    		vehicle.BoardOrDepart(subChar.networkView.viewID);
    	}
    }

    SpawnRagdoll(position, rotation, damage, attackerPos);
    EnableDeathCam();
    keyInventory.clearKeys();
    Invoke("Respawn",5);
    
    var weapons = ComponentUtil.GetComponentInHierarchy(localPlayer,typeof(Weapons)) as Weapons;
    if ( weapons ) {
        weapons.HideWeapon();
    //    weapons.ResetInventory();
    }
    showKiller = true;
}

@RPC
public function DieRemote(networkPlayer: NetworkPlayer, position : Vector3, rotation : Quaternion, damage: int, attackerPos: Vector3, attackerID: NetworkViewID, info : NetworkMessageInfo) {
    var attacker: GameObject = null;
    var attackerNV = NetworkView.Find(attackerID);
    if (attackerNV != null)
    {
        attacker = attackerNV.gameObject;
    }

	// notify the game mode that a player has died
	HandlerManager.GameHandler.CurrentGameMode.OnPlayerDeath(networkPlayer);

    // Only the server should be sending out the scoreboard updates.
    if(Network.isServer) {
        var scoreboardGO : GameObject = GameObject.Find("Scoreboard(Clone)");
        if(scoreboardGO != null) {
            var scoreboard : Scoreboard = scoreboardGO.GetComponent(Scoreboard);
            if(scoreboard != null) {
                scoreboard.AddDeath(networkPlayer);

                var networkChar = ComponentUtil.GetComponentInHierarchy(attacker,typeof(CharacterNetwork)) as CharacterNetwork;
                if (networkChar != null){
                    if(networkChar.networkPlayer == networkPlayer)
                    {
                        scoreboard.RemoveKill(networkChar.networkPlayer);
                        
                        // if the player killed him/herself, deduct 2 points from the score
                        if(HandlerManager.GameHandler.RabbitGameMode != null) {
                        	scoreboard.AddPlayerScore(networkChar.networkPlayer, -2);
                        }
                    }
                    else
                    {
                        scoreboard.AddKill(networkChar.networkPlayer);
                        
                        if(HandlerManager.GameHandler.RabbitGameMode != null) {
                        	// if the player killed was the rabbit holder, give 5 points to the killer, otherwise give 2
                        	scoreboard.AddPlayerScore(networkChar.networkPlayer, HandlerManager.GameHandler.RabbitGameMode.calculateScoreFromKill(networkPlayer));
		                }
                    }

                    //Tell the player who killed him:
                    networkView.RPC("SetLastKilledBy", 
                            networkPlayer,
                            scoreboard.GetDisplayName(networkChar.networkPlayer)
                            );
                }
            }
        }
    } else {
        Die(position, rotation, damage, attackerPos);
    }
}

function Respawn() {
    if(Network.connections.Length > 0 && gameObject.networkView != null) {
        gameObject.networkView.RPC("DisableDeathCam",
                                    RPCMode.AllBuffered);
    }
    else {
        DisableDeathCam();
    }
    
    var weapons = ComponentUtil.GetComponentInHierarchy(localPlayer,typeof(Weapons)) as Weapons;
    if ( weapons ) {
        weapons.ResetInventory();
    }
	//TODO: reset health here
	var health = ComponentUtil.GetComponentInHierarchy(localPlayer,"Health") as Health;
	health.ResetHealth();
	
    showKiller = false;
    lastKilledBy = "";
}

function SpawnRagdoll(position : Vector3, rotation : Quaternion, damage: int, attackerPosition : Vector3) {
    DeadBodyManager.SpawnRagdoll(position, rotation, damage, attackerPosition);
}

function EnableDeathCam() {
    // Network players (and the local player) need to disable the character graphic while the character is dead.
	var charRoot : Transform = transform.root;
	var vehicle = transform.root.GetComponent(Vehicle);
    if (vehicle) {
    	charRoot = vehicle.driverSeat; // workaround - don't make the vehicle disappear if its driver dies
    }
    var renderers = charRoot.GetComponentsInChildren(Renderer);
    for(var renderIndex = 0; renderIndex < renderers.Length; renderIndex++) {
        var renderer : Renderer = renderers[renderIndex] as Renderer;
        if(!renderer.CompareTag("Flag")) {
        	renderer.enabled = false;
        }
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

