

private var networkManager: NetworkManager;
private var controller : FPSInputController;

function Start() {

    networkManager = GameObject.FindObjectOfType(NetworkManager);
}

function Awake () {
    controller = GetComponent(FPSInputController);
}

// Update is called once per frame
function Update () {

    if( !IsMyPlayerCharacter() ) {
        Debug.Log("Disabling FPSC: " + networkView.viewID);
        controller.enabled = false;
        return;
    }
}

function IsMyPlayerCharacter(): boolean {

    return networkManager == null || networkManager.IsSinglePlayer() || networkView.isMine;
}

