private var npcControllerPrefab: GameObject;
private var graphicsPrefab: GameObject;
private var legacyPrefab: GameObject;

function Start () {
    
    npcControllerPrefab = Resources.Load("Characters/NPCController", GameObject);
    graphicsPrefab = Resources.Load("Characters/CharacterGraphics", GameObject);
    legacyPrefab = Resources.Load("Characters/CharacterLegacy", GameObject);
}

function spawnNPC(networked: boolean): GameObject {
    
    var chr: GameObject = GameObject.Instantiate(npcControllerPrefab,
                                                transform.position,
                                                transform.rotation);
                                               
    var model: GameObject = NetworkUtil.Instantiate(graphicsPrefab,
                                                transform.position,
                                                transform.rotation,
                                                NetworkGroup.CharacterGraphics);
    
    var legacy: GameObject = NetworkUtil.Instantiate(legacyPrefab,
                                                transform.position,
                                                transform.rotation,
                                                NetworkGroup.CharacterLegacy);
    model.transform.parent = chr.transform;
    model.networkView.observed = chr.transform;
    legacy.transform.parent = chr.transform;
    legacy.networkView.observed = chr.transform;
    
    if(Network.connections.Length > 0) {
        legacy.networkView.RPC("reattachModel", RPCMode.AllBuffered, model.networkView.viewID);
        model.networkView.RPC("attachCharacterNetwork", RPCMode.AllBuffered);
    }
    return chr;
}
