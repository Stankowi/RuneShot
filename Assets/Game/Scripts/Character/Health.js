

private static var defaultHealth: int = 100;
private var health: int = defaultHealth;;
private var networkManager: NetworkManager;
private var character: Character;
private var player: PlayerCharacter;
private var mainGUI: MainGUI;


function Awake() {
    character = GetComponent(Character);
    player = GetComponent(PlayerCharacter);
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
    gameObject.transform.position = spawnPoint.transform.position;
}

function ResetHealth() {
    health = defaultHealth;
}

function GetHealth(): int {

    return health;
}

function GetMaxHealth(): int {

    return defaultHealth;
}
