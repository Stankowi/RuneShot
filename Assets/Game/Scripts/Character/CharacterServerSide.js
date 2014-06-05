#pragma strict

var impactDamageThreshold = 10.0;

function OnTriggerEnter(other : Collider) {
	if (other.rigidbody && !other.rigidbody.isKinematic) {
		var vel : Vector3 = other.rigidbody.velocity;
		if (Network.isServer) {
			this.networkView.RPC("OnHitByRigidbody", this.networkView.owner, other.rigidbody.mass, vel.x, vel.y, vel.z);
		} else if (Network.connections.Length == 0) {
			this.OnHitByRigidbody(other.rigidbody.mass, vel.x, vel.y, vel.z);
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
}
@RPC
function StopSendingInput(id : NetworkViewID) {
	var fps : FPSInputController = this.GetComponentInParent(FPSInputController) as FPSInputController;
	if (fps) {
		fps.StopSendingInput(NetworkView.Find(id));
	}
}

// - to handle physics knockback / damage
@RPC
function OnHitByRigidbody(mass : float, velX : float, velY : float, velZ : float) {
	var motor : CharacterMotor = this.GetComponentInParent(CharacterMotor) as CharacterMotor;
	if (motor) {
		var hitVel : Vector3 = Vector3(velX, Mathf.Max(1, velY), velZ);
		hitVel *= Mathf.Min(2, mass / this.rigidbody.mass);
		motor.movement.velocity += hitVel;
		var damage : float = hitVel.magnitude - this.impactDamageThreshold;
		Debug.Log("Collision damage: " + damage);
		if (damage > 0) {
			// todo: apply damage
		}
	}
}
