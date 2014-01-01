private var health: int = Base.health();
private var networkManager: NetworkManager;
private var character: Character;
private var player: PlayerCharacter;
private var mainGUI: MainGUI;


function Awake() {
    character = ComponentUtil.GetComponentInHierarchy(gameObject,Character);
    player = ComponentUtil.GetComponentInHierarchy(gameObject,PlayerCharacter);

    networkManager = GameObject.FindObjectOfType(NetworkManager);
    mainGUI = GameObject.FindObjectOfType(MainGUI);

    // if this is the controlling Client's Health component, notify the main UI element
    if( networkManager != null && networkManager.IsMyPlayerCharacter(player) ) {
        if( mainGUI != null ) {
           mainGUI.SetPlayerHealth( this );
        }
    }
}

function ResolveDamage(damage: int, attacker : GameObject) {
    health -= damage;
    Debug.Log("Health is now " + health);

    if (health <= 0) {
        // probably not the right way to handle death, but works for now.
        Die(damage,attacker);
    }
}

function Die(damage: int, attacker : GameObject) {
    if(Network.connections.Length > 0 && gameObject.networkView != null) {
        gameObject.networkView.RPC("SpawnRagdoll", 
                                    RPCMode.AllBuffered, 
                                    gameObject.transform.root.position,
                                    gameObject.transform.root.rotation, 
                                    damage, 
                                    attacker.transform.position);
    }
    else {
        SpawnRagdoll(   gameObject.transform.root.position,
                        gameObject.transform.root.rotation, 
                        damage, 
                        attacker.transform.position);
    }
    var spawnPoints: GameObject[] = GameObject.FindGameObjectsWithTag("SpawnPoint");
    var pointIndex: int = Random.Range(0.0, spawnPoints.length);
    var spawnPoint: GameObject = spawnPoints[pointIndex];

    ResetHealth();
    gameObject.transform.root.position = spawnPoint.transform.position;
}

@RPC
function SpawnRagdoll(position : Vector3, rotation : Quaternion, damage: int, attackerPosition : Vector3) {
    DeadBodyManager.SpawnRagdoll(position, rotation, damage, attackerPosition);
}


function ResetHealth() {
    health = Base.health();
}

function GetHealth(): int {
    return health;
}

function GetMaxHealth(): int {
    return Base.health();
}
