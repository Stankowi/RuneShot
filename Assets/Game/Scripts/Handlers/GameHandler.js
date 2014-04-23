#pragma strict

@script RequireComponent(GameMode)
private var gameMode: GameMode;

function Awake() {
	// let the handler manager know of this handler
	Debug.Log("Initializing GameHandler with HandlerManager");
	HandlerManager.GameHandler = this;
}

function Start() {
	gameMode = this.GetComponent(GameMode);
	// ensure that a game mode component is attached (even if it is required by this script)
	if(!gameMode) {
		Debug.LogError("No game mode found! Deactivating GameHandler...");
		this.gameObject.SetActive(false);
	} else {
		// ensure that the GameMode component is not the base type
		if(gameMode.GetType() == GameMode) {
			Debug.LogError("The game mode has to be specified! Deactivating GameHandler...");
			this.gameObject.SetActive(false);
		} else {
			Debug.Log("Game mode set to " + gameMode.GetType());
		}
	}
}

function OnPlayerDisconnected(player: NetworkPlayer) {
	// overwrite this in game modes
}
