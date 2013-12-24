

private var networkManager: NetworkManager;
private var controller : FPSInputController;
public var keyInventory : KeyInventory;
private var powerCalcStart : int = 0;
private var bouncyGranade: GameObject;

function Start() {
    networkManager = GameObject.FindObjectOfType(NetworkManager);
    bouncyGranade = Resources.Load("Guns/BouncyGranade", GameObject);}

function Awake () {
    keyInventory = GetComponent(KeyInventory);
    controller = GetComponent(FPSInputController);
}

// Update is called once per frame
function Update () {

    if( !IsMyPlayerCharacter() ) {
        Debug.Log("Disabling FPSC: " + networkView.viewID);
        controller.enabled = false;
        return;
    }


    if (Input.GetKeyDown(KeyCode.B)) {
        StartPowerCalc();
    }

    if (Input.GetKeyUp(KeyCode.B)) {
        EndPowerCalc();
    }
}


function IsMyPlayerCharacter(): boolean {

    return networkManager == null || networkManager.IsSinglePlayer() || networkView.isMine;
}

function OnControllerColliderHit (hit : ControllerColliderHit) {

    //print( "Player OnControllerColliderHit" + hit.collider.tag );

}

function StartPowerCalc() {
    powerCalcStart = Time.time;
}

function EndPowerCalc() {
    if (this.powerCalcStart == 0) {
        return null;
    }

    var end = Time.time;

    var throwPos = transform.TransformPoint(0, 1, 1);

    var bouncy = Instantiate(bouncyGranade, throwPos, Quaternion.identity);
    bouncy.rigidbody.AddRelativeForce(FacingVector() * Power(this.powerCalcStart, end), ForceMode.Force);
    powerCalcStart = 0;

    return null;
}

function Power(start : int, end : int): int {
    return Mathf.Min((end - start) * 1000, 10000);
}

function FacingVector() {
    return Camera.main.transform.forward;
}
