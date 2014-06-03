#pragma strict
class Vehicle extends MonoBehaviour {
	public var turnWheels : Transform[];
	private var initialTurns : float[];

	public var motorWheels : WheelCollider[];

	public var steeringRange : float = 45.0;
	public var speedRange : float = 1000.0;

	public var occupant : PlayerCharacter;

	public var horizontalInput : float = 0.0;
	public var verticalInput : float = 0.0;

	function Start() {
		var initialTurnsBuilder : Array = new Array();
		for (var wheel : Transform in this.turnWheels) {
			initialTurnsBuilder.push(wheel.localRotation.y);
		}
		this.initialTurns = initialTurnsBuilder.ToBuiltin(float);
	}

	function Update() {
		//if (this.occupant !== null) {
			this.verticalInput = Input.GetAxis("Vertical");
			this.horizontalInput = Input.GetAxis("Horizontal");
			this.UpdateSteering(this.horizontalInput);
			this.UpdateMotorSpeed(this.verticalInput);
		//}
	}

	/*function OnSerializeNetworkView(stream : BitStream, info : NetworkMessageInfo) {
		this.verticalInput = Input.GetAxis("Vertical");
		this.horizontalInput = Input.GetAxis("Horizontal");
		stream.Serialize(this.horizontalInput);
		stream.Serialize(this.verticalInput);
	}*/

	private function UpdateMotorSpeed(inputAxis : float) {
		this.rigidbody.centerOfMass = Vector3(0, 0, -inputAxis);
		var motorSpeed : float = inputAxis * this.speedRange;
		var groundedWheels : float = 0.0;
		for (var motor : WheelCollider in this.motorWheels) {
			if (motor.isGrounded) {
				groundedWheels += 1;
			}
		}
		motorSpeed *= groundedWheels;
		this.rigidbody.AddRelativeForce(0, 0, -motorSpeed);
	}

	private function UpdateSteering(inputAxis : float) {
		var steerAngle : float = inputAxis * this.steeringRange;
		for (var index : int = 0; index < this.turnWheels.length; ++index) {
			var trans = this.turnWheels[index];
			trans.localEulerAngles.y = this.initialTurns[index] + steerAngle;
		}
	}
}
