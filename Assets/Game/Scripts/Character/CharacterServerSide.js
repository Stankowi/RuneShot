#pragma strict

var impactDamageThreshold = 10.0;

function OnTriggerEnter(other : Collider) {
	if (other.rigidbody && !other.rigidbody.isKinematic && other.GetComponent(Vehicle)) {
		var netViewID : NetworkViewID;
		var networkChar = ComponentUtil.GetComponentInHierarchy(other.gameObject, typeof(CharacterNetwork)) as CharacterNetwork;
		if (networkChar) {
			netViewID = networkChar.networkView.viewID;
		}
		if (Network.isServer) {
			this.networkView.RPC("OnHitByRigidbody", this.networkView.owner, other.rigidbody.mass, other.rigidbody.velocity, netViewID);
		} else if (Network.connections.Length == 0) {
			this.OnHitByRigidbody(other.rigidbody.mass, other.rigidbody.velocity, netViewID);
		}
	}
}

// RPCs called *by* the server:
// - to set up and tear down raw axis streaming
@RPC
function StartSendingInput(id : NetworkViewID) {
	var fps : FPSInputController = this.GetComponentInParent(FPSInputController) as FPSInputController;
	if (fps) {
		fps.StartSendingInput(NetworkView.Find(id));
	}
	this.collider.enabled = false;
}
@RPC
function StopSendingInput(id : NetworkViewID) {
	var fps : FPSInputController = this.GetComponentInParent(FPSInputController) as FPSInputController;
	if (fps) {
		fps.StopSendingInput(NetworkView.Find(id));
	}
	this.collider.enabled = true;
}

// - to handle physics knockback / damage
@RPC
function OnHitByRigidbody(mass : float, hitVel : Vector3, owner : NetworkViewID) {
	var ownerNetView : NetworkView = NetworkView.Find(owner);
	if (this.networkView.owner == ownerNetView.owner) {
		return; // don't self-damage
	}
	var motor : CharacterMotor = this.GetComponentInParent(CharacterMotor) as CharacterMotor;
	if (motor) {
		hitVel.y = Mathf.Max(1, hitVel.y);
		hitVel *= Mathf.Min(2, mass / this.rigidbody.mass);
		motor.movement.velocity += hitVel;
		var damage : float = hitVel.magnitude - this.impactDamageThreshold;
		if (damage >= 1) {
			Debug.Log("Collision damage: " + damage);
			var health : Health = ComponentUtil.GetComponentInHierarchy(this.gameObject, Health);
			if (health) {
				health.ResolveDamage(Mathf.FloorToInt(damage), ownerNetView.gameObject);
			}
		}
	}
}
