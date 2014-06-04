#pragma strict
class Vehicle extends MonoBehaviour {
	public var turnWheels : Transform[];
	private var initialTurns : float[];

	public var motorWheels : WheelCollider[];

	public var steeringRange : float = 30.0;
	public var speedRange : float = 100.0;
	private var steerAngle : float;
	private var motorSpeed : float;

	public var occupant : GameObject;
	public var driverDoor : Transform;
	public var driverSeat : Transform;

	private var horizontalInput : float = 0.0;
	private var verticalInput : float = 0.0;

	function Start() {
		this.initialTurns = new float[this.turnWheels.length];
		for (var index : int = 0; index < this.turnWheels.length; ++index) {
			this.initialTurns[index] = this.turnWheels[index].localEulerAngles.y;
		}
	}

	function Update() {
		var targetDoorAngle : float = 45.0;
		if (this.occupant) {
			targetDoorAngle = 0.0;
			this.occupant.transform.position = driverSeat.transform.position;
		}
		this.driverDoor.localEulerAngles.y = Mathf.LerpAngle(this.driverDoor.localEulerAngles.y, targetDoorAngle, Time.deltaTime * 5);
	}

	function FixedUpdate() {
		this.motorSpeed = -this.verticalInput * this.speedRange;
		this.steerAngle = this.horizontalInput * this.steeringRange;
		this.rigidbody.centerOfMass = Vector3(0, 0, this.motorSpeed / this.speedRange); // hack to avoid rolling the truck over too often
		if (this.transform.position.y < -0.1) {
			this.transform.position.y = -0.1; // hack to work around how wheelcolliders sometimes allow the truck to fall through collision meshes
		}
		this.UpdateSteering();
		this.UpdateMotors();
	}

	function OnSerializeNetworkView(stream : BitStream, info : NetworkMessageInfo) {
		//stream.Serialize(this.motorSpeed);
		//stream.Serialize(this.turnWheels);
		if (stream.isWriting) {
			Debug.Log("OnSerializeNetworkView : writing");
		} else {
			Debug.Log("OnSerializeNetworkView : reading");
		}
	}

	public function Board(player : GameObject, netCall : boolean) {
		if (!this.occupant && Vector3.Distance(player.transform.position, this.transform.position) < 2.0) {
			this.occupant = player;
			player.transform.parent = this.driverSeat.transform;
			player.transform.rotation = this.driverSeat.rotation;

			var charMotor : CharacterMotor = player.GetComponent(CharacterMotor) as CharacterMotor;
			var charController : CharacterController = player.GetComponent(CharacterController) as CharacterController;
			if (charMotor) {
				charMotor.SetMotorActive(false);
			}
			if (charController) {
				charController.detectCollisions = false;
			}

			this.rigidbody.isKinematic = false;

			if (!netCall) {
                var charNetView : NetworkView = player.GetComponentInChildren(CharacterGraphics).networkView;
                if (charNetView) {
		        	this.networkView.RPC("NetBoard", RPCMode.Others, charNetView.viewID, this.networkView.viewID);
		        }
			}
		}
	}

	public function Depart(player : GameObject, netCall : boolean) {
		if (this.occupant === player) {
			this.occupant = null;

			player.transform.parent = null;
			player.transform.rotation = Quaternion.Euler(0, player.transform.rotation.eulerAngles.y, 0);
			if (player.transform.position.y < 0.5) {
				player.transform.position.y = 0.5; // hack to avoid placing the player beneath the ground
			}

			this.rigidbody.isKinematic = true;
			this.SetControls(Vector2.zero);

			var charMotor : CharacterMotor = player.GetComponent(CharacterMotor) as CharacterMotor;
			var charController : CharacterController = player.GetComponent(CharacterController) as CharacterController;
			if (charMotor) {
				charMotor.movement.velocity = this.rigidbody.velocity;
				charMotor.SetMotorActive(true);
			}
			if (charController) {
				charController.detectCollisions = true;
			}

			if (!netCall) {
                var charNetView : NetworkView = player.GetComponentInChildren(CharacterGraphics).networkView;
                if (charNetView) {
		        	this.networkView.RPC("NetDepart", RPCMode.Others, charNetView.viewID, this.networkView.viewID);
		        }
			}
		}
	}

	@RPC
	function NetBoard(playerNetViewID : NetworkViewID, vehicleNetViewID : NetworkViewID) {
	    var playerNetView : NetworkView = NetworkView.Find(playerNetViewID);
	    var vehicleNetView : NetworkView = NetworkView.Find(vehicleNetViewID);
	    if (playerNetView && vehicleNetView) {
	        var vehicleObj : Vehicle = vehicleNetView.GetComponent(Vehicle) as Vehicle;
	        vehicleObj.Board(playerNetView.gameObject, true);
	        //playerNetView.transform.root.parent = vehicleObj.driverSeat;
	        //vehicleObj.occupant = playerNetView.gameObject;
	    }
	}

	@RPC
	function NetDepart(playerNetViewID : NetworkViewID, vehicleNetViewID : NetworkViewID) {
	    var playerNetView : NetworkView = NetworkView.Find(playerNetViewID);
	    var vehicleNetView : NetworkView = NetworkView.Find(vehicleNetViewID);
	    if (playerNetView && vehicleNetView) {
	        var vehicleObj : Vehicle = vehicleNetView.GetComponent(Vehicle) as Vehicle;
	        vehicleObj.Depart(playerNetView.gameObject, true);
	        //vehicleObj.occupant.transform.parent = null;
	        //vehicleObj.occupant = null;
	    }
	}

	public function SetControls(axes : Vector2) {
		this.horizontalInput = axes.x;
		this.verticalInput = axes.y;
	}

	private function UpdateMotors() {
		for (var motor : WheelCollider in this.motorWheels) {
			motor.motorTorque = this.motorSpeed;
		}
	}

	private function SetColliderTriggers(enabled : boolean) {
		for (var collider : Component in this.GetComponents(BoxCollider)) {
			(collider as Collider).isTrigger = enabled;
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
}
