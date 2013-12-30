private var networkManager: NetworkManager;
private var controller : FPSInputController;
public var keyInventory : KeyInventory;

function Start() {
    networkManager = GameObject.FindObjectOfType(NetworkManager);
}

function Awake () {
    keyInventory = GetComponent(KeyInventory);
    controller = GetComponent(FPSInputController);
}

// Update is called once per frame
function Update () {
    if( !IsMyPlayerCharacter() ) {
        //Debug.Log("Disabling FPSC: " + networkView.viewID);
        controller.enabled = false;
        return;
    }

}

function IsMyPlayerCharacter(): boolean {

    return networkManager == null || networkManager.IsSinglePlayer() || networkView.isMine;
}

function OnControllerColliderHit (hit : ControllerColliderHit) {

    //print( "Player OnControllerColliderHit" + hit.collider.tag );

}
