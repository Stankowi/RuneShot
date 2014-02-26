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
    if( player != null && networkManager != null && networkManager.IsMyPlayerCharacter(player)) {
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
    var network = ComponentUtil.GetComponentInHierarchy(gameObject,CharacterNetwork);
    if (network != null) {
        if(Network.connections.Length > 0 && gameObject.networkView != null) {
            var projectile: Weapon = ComponentUtil.GetComponentInHierarchy(attacker,typeof(Weapon)) as Weapon;
            network.gameObject.networkView.RPC("DieRemote", 
                                        RPCMode.AllBuffered,
                                        Network.player, 
                                        
                                        gameObject.transform.root.position,
                                        gameObject.transform.root.rotation, 
                                        damage,
                                        attacker.transform.position, 
                                        projectile.GetOwnerNetworkID());        
        }
        else {
            network.Die(   gameObject.transform.root.position,
                            gameObject.transform.root.rotation, 
                            damage, 
                            attacker.transform.position);
        }
    }

    // when the player dies, disable his controls and switch to the "death camera"
    if (player != null) {
        ResetHealth();
        
        var deathCam = transform.root.FindChild(PlayerDeathCamera.PrefabName());
        if(deathCam != null) {
            deathCam.gameObject.SetActive(true);
        }
    }
    else {
        networkManager.OnNPCDeath(transform.parent.gameObject);
        GameObject.Destroy(transform.parent.gameObject);
    }
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
