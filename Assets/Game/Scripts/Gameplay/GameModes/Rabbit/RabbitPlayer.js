#pragma strict

private var rabbitFlagTransform: Transform;

public function get RabbitFlagTransform() : Transform {
	return rabbitFlagTransform;
}

function Awake() {
	// get reference to the rabbit flag holder transform and set it's updated position based on where the player is currently located
	var rabbitHolder: GameObject = Resources.Load("Game Modes/Rabbit/RabbitFlagHolder", GameObject);
	var playerRabbitHolderPos: Vector3 = this.transform.position + rabbitHolder.transform.position;
	
	// instantiate the rabbit holder transform
	rabbitHolder = GameObject.Instantiate(rabbitHolder, playerRabbitHolderPos, Quaternion.identity);
	// change the name to be able to find it at Start and parent the player's transform
	rabbitHolder.name = "RabbitFlagHolder";
	rabbitHolder.transform.parent = this.transform.transform;
	
	// store the rabbit flag transform for quick reference
	rabbitFlagTransform = this.transform.FindChild("RabbitFlagHolder").transform;
	if(!rabbitFlagTransform) {
		Debug.LogError("Rabbit flag transform not found! Required to hold ze flag!");
	} else {
		Debug.Log("I found the flag transform on " + this.name);
	}
}

function OnDisable() {
	Debug.Log("WHAT");
	this.enabled = true;
}
