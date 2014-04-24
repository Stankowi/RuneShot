#pragma strict

@script ExecuteInEditMode()

function Start() {
	if(this.GetType() == GameMode) {
		Debug.LogWarning("Replace me with a valid game mode!");
	}
}

// abstract method to be overwritten
function OnPlayerDeath(player: NetworkPlayer) {
	Debug.Log("Player " + player + " died");
}