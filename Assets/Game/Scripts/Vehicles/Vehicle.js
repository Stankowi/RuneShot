#pragma strict
class Vehicle extends MonoBehaviour {
	public var turnWheels : Transform[];
	public var motorWheels : HingeJoint[];

	public var steeringRange : float = 45.0;
	public var speedRange : float = 1000.0;
	public var acceleration : float = 10.0;
	public var turboFactor : float = 3.0;

	function Start() {
		this.rigidbody.centerOfMass = Vector3(0, -1, 0);
	}

	function Update() {
		this.UpdateMotorSpeed(Input.GetAxis("Vertical"), Input.GetButton("Jump"));
		this.UpdateSteering(Input.GetAxis("Horizontal"));
	}

	private function UpdateMotorSpeed(inputAxis : float, inputFire : boolean) {
		var motorSpeed : float = inputAxis * this.speedRange;
		if (inputFire) {
			motorSpeed *= this.turboFactor;
		}
		for (var axel : HingeJoint in this.motorWheels) {
			axel.motor.targetVelocity = Mathf.Lerp(axel.motor.targetVelocity, motorSpeed, Time.deltaTime * this.acceleration);
			axel.transform.localEulerAngles.x = 0;
		}
		this.rigidbody.AddRelativeForce(0, 0, -motorSpeed);
	}

	private function UpdateSteering(inputAxis : float) {
		var steerAngle : float = inputAxis * this.steeringRange;
		for (var trans : Transform in this.turnWheels) {
			trans.localEulerAngles.y = 90 + steerAngle;
		}
	}
}
