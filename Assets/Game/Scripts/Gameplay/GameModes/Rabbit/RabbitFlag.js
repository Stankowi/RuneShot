#pragma strict

private var layerMask: int;
private var pickedUp: boolean;
private var canPickUp: boolean;
private var displayFlagMsg: boolean;

function Awake() {
    // set up the initial settings
    layerMask = 1 << 16 && 1 << 17;
    layerMask = ~layerMask;
    pickedUp = false;
    canPickUp = true;
    displayFlagMsg = false;
}

function Start() {
    // store reference to this in RabbitMode
    HandlerManager.GameHandler.RabbitGameMode.Flag = this;
}

function Update() {
    // move the flag towards the floor only if it isn't grounded already
    if(!pickedUp && !Physics.Raycast(this.transform.position, Vector3.down, 0.5f, layerMask)) {
		//Debug.Log("Nothing below flag, moving down");
		transform.position.y -= 1.0f * Time.deltaTime;
	}
}

function OnTriggerEnter(other: Collider) {
	// not able to be picked up due to cooldown or already picked up by another player, therefore return
	if(!canPickUp) {
		return;
	}

	// return if this is not the server
	/*if(Network.isClient) {
		return;
	}*/
	
	// ensure the collider is a player
	if(other.CompareTag("Player")) {
		// store reference to the RabbitPlayer component
		var rabbitPlayer: RabbitPlayer = other.GetComponent(RabbitPlayer);
		
		// ensure that we found the RabbitPlayer component
		if(rabbitPlayer) {
            var rabbitPlayerNetID = getOwnerNetworkID(rabbitPlayer);
			// send an RPC to all connected clients that the flag is being picked up
			this.networkView.RPC("Pickup", RPCMode.AllBuffered, rabbitPlayerNetID);
			this.networkView.RPC("relayToRabbitMode", RPCMode.AllBuffered, other.GetComponentInChildren(CharacterNetwork).networkPlayer, rabbitPlayerNetID);
		}
	}
}

private function getOwnerNetworkID(rabbitPlayer: RabbitPlayer): NetworkViewID {
	var networkID: NetworkViewID;
	var networkChar: CharacterNetwork = rabbitPlayer.GetComponentInChildren(CharacterNetwork);
	
	// ensure we found the CharacterNetwork component
	if (networkChar) {
	    networkID = networkChar.networkView.viewID;
	    Debug.Log("Found rabbit player network id: " + networkID);
	} else {
		Debug.LogError("Could not find CharacterNetwork in children of " + rabbitPlayer.name + "!");
	}

	return networkID;
}

@RPC
function relayToRabbitMode(player: NetworkPlayer, playerNetID: NetworkViewID) {
	// set the current owner of the rabbit flag
    HandlerManager.GameHandler.RabbitGameMode.playerPickedUpFlag(player, playerNetID);
}

@RPC
function Pickup(netViewID: NetworkViewID) {
    // find the network view that is associated with the playerID sent over the network and get the RabbitPlayer component attached to the same game object
    var playerNetView = NetworkView.Find(netViewID);
    if(playerNetView) {
        Debug.Log(playerNetView.gameObject.name + " (ID: " + netViewID + ") has the flag!");
        var playerRootObj = playerNetView.gameObject.transform.root;
        var rabbitPlayer = playerRootObj.GetComponent(RabbitPlayer);
        
        if(rabbitPlayer) {
            this.transform.position = rabbitPlayer.RabbitFlagTransform.position;
            this.transform.parent = rabbitPlayer.RabbitFlagTransform;
            pickedUp = true;
            canPickUp = false;
            
            // see if I have the flag
            if(rabbitPlayer.GetComponentInChildren(CharacterNetwork).networkPlayer == Network.player) {
                Debug.Log("I have the flag!");
                displayFlagMsg = true;
            }
        } else {
            Debug.LogError("RabbitPlayer component not found on root object of " + playerNetView.gameObject + "! This component is required!");
        }
    }
}

@RPC
function Drop() {
    this.transform.parent = null;
    pickedUp = false;
    canPickUp = true;
    displayFlagMsg = false;
}

// hacked in to get the client holding the flag to drop it properly
function DropFromHolder() {
	this.transform.parent = null;
    pickedUp = false;
    displayFlagMsg = false;
    yield WaitForCooldownOnFlag();
}

function WaitForCooldownOnFlag() {
	yield WaitForSeconds(10);
	canPickUp = true;
}

function OnGUI() {
    if(displayFlagMsg) {
        GUI.Label(Rect(Screen.width / 2 - 100.0f, 25.0f, 200.0f, 25.0f), "You have the flag.. RUN!");
    }
}
