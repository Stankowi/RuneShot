private var networkManager: NetworkManager;
private var controller : FPSInputController;
public var keyInventory : KeyInventory;

function Start() {
    networkManager = GameObject.FindObjectOfType(NetworkManager);
}

function Awake () {
    keyInventory = ComponentUtil.GetComponentInHierarchy(gameObject,KeyInventory);
    controller = ComponentUtil.GetComponentInHierarchy(gameObject,FPSInputController);
}

function IsMyPlayerCharacter(): boolean {

    return networkManager == null || networkManager.IsSinglePlayer() || networkView.isMine;
}

function OnControllerColliderHit (hit : ControllerColliderHit) {

    //print( "Player OnControllerColliderHit" + hit.collider.tag );

}
