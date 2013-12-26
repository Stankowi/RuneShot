private var playerPrefab: GameObject;
private var modelPrefab: GameObject;
private var cameraPrefab: GameObject;

function Start () {
    
    playerPrefab = Resources.Load("Characters/PlayerCharacter", GameObject);
    modelPrefab = Resources.Load("Characters/CharacterGraphics", GameObject);
    cameraPrefab = Resources.Load("Characters/PlayerCamera", GameObject);
}

function spawnCharacter(networked: boolean) {

    var chr: GameObject;
    var model: GameObject;

    if( networked ) {
        chr = Network.Instantiate(playerPrefab, transform.position, transform.rotation, 1);
        
        model = Network.Instantiate(modelPrefab, transform.position, transform.rotation, 1);
        
        chr.networkView.RPC("reattachModel", RPCMode.AllBuffered, model.networkView.viewID);
    }
    else {
        chr = GameObject.Instantiate(playerPrefab, transform.position, transform.rotation);
        model = GameObject.Instantiate(modelPrefab, transform.position, transform.rotation);
    }

    model.transform.parent = chr.transform;
    
    var camera = GameObject.Instantiate(cameraPrefab, transform.position + Vector3(0, 0.907084, 0), transform.rotation);
    camera.transform.parent = chr.transform;
}
