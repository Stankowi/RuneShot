#pragma strict

// When other components need to "activate" this script, the prefab
// it is attached to needs to be enabled. GetComponent does not find inactive game objects,
// so the best way to find and enable the game object this script is attached to
// is to search for it by name.
static public function PrefabName() {
    return "DeathCamera(Clone)";
}

static var playerCameraPrefab = "PlayerCamera(Clone)";

// When the death camera is toggled on, disable local player controls.
// This allows the death camera to watch the location the player died for a few seconds,
// and give more impact to the player's death.
function OnEnable () {    
    gameObject.transform.root.gameObject.GetComponent(FPSInputController).enabled = false;
    gameObject.transform.root.gameObject.GetComponent(MouseLook).enabled = false;
    gameObject.transform.root.gameObject.GetComponent(CharacterMotor).enabled = false;
    transform.root.FindChild(playerCameraPrefab).gameObject.SetActive(false);
    
}

public function Respawn() {
    gameObject.transform.root.gameObject.GetComponent(FPSInputController).enabled = true;
    gameObject.transform.root.gameObject.GetComponent(MouseLook).enabled = true;
    gameObject.transform.root.gameObject.GetComponent(CharacterMotor).enabled = true;
    transform.root.FindChild(playerCameraPrefab).gameObject.SetActive(true);
    
    // select a spawn point to respawn the player on.
    var spawnPoints: GameObject[] = GameObject.FindGameObjectsWithTag("SpawnPoint");
    var pointIndex: int = Random.Range(0.0, spawnPoints.length);
    var spawnPoint: GameObject = spawnPoints[pointIndex];
    gameObject.transform.root.position = spawnPoint.transform.position;
    
    // Disable the death camera.
    gameObject.SetActive(false);

}