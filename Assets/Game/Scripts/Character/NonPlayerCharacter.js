

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
   
}

function OnControllerColliderHit (hit : ControllerColliderHit) {

    //print( "Player OnControllerColliderHit" + hit.collider.tag );

}

function FacingVector() {
    return Camera.main.transform.forward;
}
