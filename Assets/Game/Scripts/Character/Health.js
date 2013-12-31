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

function ResolveDamage(damage: int) {
    health -= damage;
    Debug.Log("Health is now " + health);

    if (health <= 0) {
        // probably not the right way to handle death, but works for now.
        Die();
    }
}

function Die() {
    var spawnPoints: GameObject[] = GameObject.FindGameObjectsWithTag("SpawnPoint");
    var pointIndex: int = Random.Range(0.0, spawnPoints.length);
    var spawnPoint: GameObject = spawnPoints[pointIndex];

    ResetHealth();
    gameObject.transform.root.position = spawnPoint.transform.position;
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
