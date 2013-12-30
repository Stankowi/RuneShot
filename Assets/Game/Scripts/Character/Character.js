
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

function CallRemote(): boolean {

    return networkManager == null || !networkManager.IsSinglePlayer() || Network.isClient;
}

@RPC
function reattachModel( modelID: NetworkViewID ) {

    var model = NetworkView.Find(modelID);

    model.transform.parent = transform;
}
