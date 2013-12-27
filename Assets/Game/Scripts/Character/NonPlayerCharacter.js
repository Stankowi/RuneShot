

private var networkManager: NetworkManager;
private var controller : NonPlayerController;

function Start() {
    networkManager = GameObject.FindObjectOfType(NetworkManager);
}

function Awake () {
    controller = GetComponent(NonPlayerController);
}

// Update is called once per frame
function Update () {

    /*
    if (Input.GetKeyDown(KeyCode.B)) {
        StartPowerCalc();
    }

    if (Input.GetKeyUp(KeyCode.B)) {
        EndPowerCalc();
    }
    */
    
}

function OnControllerColliderHit (hit : ControllerColliderHit) {

    //print( "Player OnControllerColliderHit" + hit.collider.tag );

}

function FacingVector() {
    return Camera.main.transform.forward;
}
