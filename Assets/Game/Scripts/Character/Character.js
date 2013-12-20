
private var networkManager: NetworkManager;

function Start() {

    networkManager = GameObject.FindObjectOfType(NetworkManager);
}

function IsClient(): boolean {

    return networkManager == null || networkManager.IsSinglePlayer() || Network.isClient;
}

function IsServer(): boolean {

    return networkManager == null || networkManager.IsSinglePlayer() || Network.isServer;
}

@RPC
function reattachModel( modelID: NetworkViewID ) {
    Debug.Log("Reattach: " + modelID + " - " + NetworkView.Find(modelID) );

    var model = NetworkView.Find(modelID);
    
    model.transform.parent = transform;
}

