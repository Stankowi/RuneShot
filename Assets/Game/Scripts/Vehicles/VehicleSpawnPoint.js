#pragma strict

var vehiclePrefab : GameObject;
var timer : float = 0.0;

function Update() {
	if (Network.isServer) {
		this.timer += Time.deltaTime;
		if (this.timer > 5.0) {
			Debug.LogError("spawning rover");
			this.timer = -115.0;
			NetworkUtil.Instantiate(this.vehiclePrefab, Vector3.zero, Quaternion.identity, 0);
		}
	}
}
