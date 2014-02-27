private var cameraPrefab: GameObject;
private var controllerPrefab: GameObject;
private var graphicsPrefab: GameObject;
private var legacyPrefab: GameObject;
private var deathPrefab: GameObject;
private var crosshairPrefab: GameObject;
private var gunPrefab: GameObject;
// Spawn the camera in the head of the character
private var cameraOffset = Vector3(0,1.5,0);

function Start () {
    
    cameraPrefab = Resources.Load("Characters/PlayerCamera", GameObject);    
    controllerPrefab = Resources.Load("Characters/CharacterController", GameObject);
    graphicsPrefab = Resources.Load("Characters/CharacterGraphics", GameObject);
    legacyPrefab = Resources.Load("Characters/CharacterLegacy", GameObject);
    deathPrefab = Resources.Load("Characters/DeathCamera", GameObject);
    crosshairPrefab = Resources.Load("Characters/Crosshair", GameObject);
    gunPrefab = Resources.Load("Bazooka/prefabs/bazooka", GameObject);
}

function spawnCharacter(networked: boolean) {
    var chr: GameObject = GameObject.Instantiate(controllerPrefab,
                                                transform.position,
                                                transform.rotation);
    
    var death: GameObject = GameObject.Instantiate(deathPrefab,
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
                                                
    Instantiate(crosshairPrefab);
                                              
    model.transform.parent = chr.transform;
    model.networkView.observed = chr.transform;
    legacy.transform.parent = chr.transform;
    legacy.networkView.observed = chr.transform;
    
    
    var camera = GameObject.Instantiate(cameraPrefab, transform.position, transform.rotation);
    camera.transform.parent = chr.transform;
    // Position the camera relative to the character, at an offset high enough up to be in the head.
    camera.transform.localPosition = cameraOffset;
    
    var gun = GameObject.Instantiate(gunPrefab, camera.transform.position, Quaternion(0.0, 0.0, 0.0, 0.0));
    gun.transform.parent = camera.transform;
    gun.transform.localPosition = Vector3(.23,-.12,.4);
    gun.transform.localRotation = Quaternion.Euler(0.0, 90.0, 0.0);
    
    Screen.lockCursor = true;
    
    death.transform.parent = chr.transform;
    death.transform.localPosition = Vector3(0,4,-6);
    death.transform.LookAt(camera.transform);
    
    if(Network.connections.Length > 0) {
        legacy.networkView.RPC("reattachModel", RPCMode.AllBuffered, model.networkView.viewID);
        model.networkView.RPC("attachCharacterNetwork", RPCMode.AllBuffered,Network.player);
    }
    
}