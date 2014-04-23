#pragma strict

private var layerMask: int;
private var pickedUp: boolean;
private var canPickUp: boolean;

function Awake() {
	layerMask = 1 << 16 && 1 << 17;
	layerMask = ~layerMask;
	pickedUp = false;
	canPickUp = true;
}

function Update() {
	if(!pickedUp && !Physics.Raycast(this.transform.position, Vector3.down, 0.5f, layerMask)) {
		Debug.Log("Nothing below flag, moving down");
		transform.position.y -= 1.0f * Time.deltaTime;
	}
}

function OnTriggerEnter(other : Collider) {
	// not able to be picked up due to cooldown or already picked up by another player, therefore return
	if(!canPickUp) {
		return;
	}

	// return if this is not the server
	if(Network.isClient) {
		return;
	}
	
	// ensure the collider is a player
	if(other.CompareTag("Player")) {
		// store reference to the RabbitPlayer component
		var rabbitPlayer: RabbitPlayer = other.GetComponent(RabbitPlayer);
		// ensure that we found the RabbitPlayer component
		if(rabbitPlayer) {
			// send an RPC to all connected clients that the flag is being picked up
			this.networkView.RPC("pickUpRabbitFlag", RPCMode.AllBuffered, getOwnerNetworkID(rabbitPlayer));
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
function pickUpRabbitFlag(playerID: NetworkViewID) {
	var playerNetView = NetworkView.Find(playerID);
	Debug.Log(playerNetView.gameObject.name + " (ID: " + playerID + ") has the flag!");
	var playerRootObj = playerNetView.gameObject.transform.root;
	var rabbitPlayer = playerRootObj.GetComponent(RabbitPlayer);
	
	if(rabbitPlayer) {
		this.transform.position = rabbitPlayer.RabbitFlagTransform.position;
		this.transform.parent = rabbitPlayer.RabbitFlagTransform;
		pickedUp = true; // ffr, something like this doesn't need to be done on the client
		canPickUp = false; // neither does this because these two variables won't affect anything on the client (trying to move towards server/client infrastructure)
	} else {
		Debug.LogError("RabbitPlayer component not found on root object of " + playerNetView.gameObject + "! This component is required!");
	}
}
