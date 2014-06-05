#pragma strict
class Vehicle extends MonoBehaviour {
	public var turnWheels : Transform[];
	private var initialTurns : float[];

	public var motorWheels : WheelCollider[];

	public var steeringRange : float = 30.0;
	public var speedRange : float = 100.0;
	private var steerAngle : float;
	private var motorSpeed : float;
	private var axes : Vector2;
	private var readSinglePlayerInput : boolean = false;

	private var occupantNetView : NetworkView;
	private var occupantCharacter : GameObject;

	public var driverDoor : Transform;
	public var driverSeat : Transform;

	public var scriptNetView : NetworkView;

	function Start() {
		this.initialTurns = new float[this.turnWheels.length];
		for (var index : int = 0; index < this.turnWheels.length; ++index) {
			this.initialTurns[index] = this.turnWheels[index].localEulerAngles.y;
		}
	}

	function Update() {
		if (this.readSinglePlayerInput) {
			this.axes = Vector2(Input.GetAxis("Horizontal"), Input.GetAxis("Vertical"));
		}
		var targetDoorAngle : float = 45.0;
		if (this.occupantCharacter) {
			targetDoorAngle = 0.0;
			this.occupantCharacter.transform.position = driverSeat.transform.position;
		}
		this.driverDoor.localEulerAngles.y = Mathf.LerpAngle(this.driverDoor.localEulerAngles.y, targetDoorAngle, Time.deltaTime * 5);
	}

	function FixedUpdate() {
		this.motorSpeed = -this.axes.y * this.speedRange;
		this.steerAngle = this.axes.x * this.steeringRange;
		this.rigidbody.centerOfMass = Vector3(0, 0, this.motorSpeed / this.speedRange); // hack to avoid rolling the truck over too often.  (could be improved by a stablizer bar)
		if (this.transform.position.y < -0.1) {
			this.transform.position.y = -0.1; // hack to work around how wheelcolliders sometimes allow the truck to fall through collision meshes (unknown why this is happening at all)
		}
		this.UpdateSteering();
		this.UpdateMotors();
	}

	private function UpdateMotors() {
		for (var motor : WheelCollider in this.motorWheels) {
			motor.motorTorque = this.motorSpeed;
		}
	}

	private function UpdateSteering() {
		for (var index : int = 0; index < this.turnWheels.length; ++index) {
			var trans : Transform = this.turnWheels[index];
			var wheelCollider : WheelCollider = trans.gameObject.GetComponent(WheelCollider) as WheelCollider;
			if (wheelCollider) {
				wheelCollider.steerAngle = steerAngle;
			} else {
				trans.localEulerAngles.y = this.initialTurns[index] + steerAngle;
			}
		}
	}

	function OnSerializeNetworkView(stream : BitStream, info : NetworkMessageInfo) {
		stream.Serialize(this.motorSpeed);
		stream.Serialize(this.steerAngle);
	}

	@RPC
	function SetInputAxes(x : float, y : float, info : NetworkMessageInfo) {
		if (info.sender == this.occupantNetView.owner) {
			this.axes = Vector2(x, y);
		}
	}

	@RPC
	function BoardOrDepart_SinglePlayer(id : NetworkViewID) {
		if (Network.connections.Length == 0) {
			if (!this.occupantNetView) {
				this.Board(id);
				this.readSinglePlayerInput = true;
			} else if (this.occupantNetView.viewID == id) {
				this.Depart(id);
				this.readSinglePlayerInput = false;
			}
		}
	}

	@RPC
	function BoardOrDepart(id : NetworkViewID, info : NetworkMessageInfo) {
		if (Network.isServer) {
			if (!this.occupantNetView) {
				this.Board(id);
				this.networkView.RPC("Board", RPCMode.OthersBuffered, id);
				NetworkView.Find(id).RPC("StartSendingInput", info.sender, this.networkView.viewID);
			} else if (this.occupantNetView.viewID == id) {
				this.Depart(id);
				this.networkView.RPC("Depart", RPCMode.OthersBuffered, id);
				NetworkView.Find(id).RPC("StopSendingInput", info.sender, this.networkView.viewID);
			}
		}
	}

	@RPC
	public function Board(id : NetworkViewID) {
		this.occupantNetView = NetworkView.Find(id);
		this.occupantCharacter = this.occupantNetView.transform.root.gameObject;
		this.occupantCharacter.transform.parent = this.driverSeat.transform;
		this.occupantCharacter.transform.rotation = this.driverSeat.rotation;

		this.rigidbody.isKinematic = false;

		var charMotor : CharacterMotor = this.occupantCharacter.GetComponent(CharacterMotor) as CharacterMotor;
		var charController : CharacterController = this.occupantCharacter.GetComponent(CharacterController) as CharacterController;
		if (charMotor) { charMotor.SetMotorActive(false); }
		if (charController) { charController.detectCollisions = false; }
	}

	@RPC
	public function Depart(id : NetworkViewID) {
		if (this.occupantNetView.viewID == id) {
			var charMotor : CharacterMotor = this.occupantCharacter.GetComponent(CharacterMotor) as CharacterMotor;
			var charController : CharacterController = this.occupantCharacter.GetComponent(CharacterController) as CharacterController;
			if (charMotor) {
				charMotor.movement.velocity = this.rigidbody.velocity;
				charMotor.SetMotorActive(true);
			}
			if (charController) {
				charController.detectCollisions = true;
			}

			this.rigidbody.isKinematic = true;

			this.occupantCharacter.transform.parent = null;
			this.occupantCharacter.transform.rotation = Quaternion.Euler(0, this.occupantCharacter.transform.rotation.eulerAngles.y, 0);
			if (this.occupantCharacter.transform.position.y < 1) {
				this.occupantCharacter.transform.position.y = 1; // hack to avoid placing the player beneath the ground
			}

			this.occupantNetView = null;
			this.occupantCharacter = null;
			this.axes = Vector2.zero;
		}
	}
}
