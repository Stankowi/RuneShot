private var health: float = Base.health();
private var networkManager: NetworkManager;
private var character: Character;
private var player: PlayerCharacter;
private var characterStatusEffect : CharacterStatusEffect;
private var mainGUI: MainGUI;
private var invincible;

function Start() {
    characterStatusEffect = this.transform.root.GetComponentInChildren(CharacterStatusEffect);
}

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

function Update() {
    
    if (characterStatusEffect) {
        UpdateHealth();
    }
}

function ResolveDamage(damage: int, attacker : GameObject) {

    if(invincible){
        return;
    }
    
    //Don't resolve any damage if death cam is active
    var deathCam = transform.root.FindChild(PlayerDeathCamera.PrefabName());
    if(deathCam != null)
    {
        if(deathCam.gameObject.activeSelf)
        {
            return;
        }
    }
    
    // check to see if character has any powerups that augement damage
    if (characterStatusEffect &&
        characterStatusEffect.Powerup &&
        characterStatusEffect.Powerup.GetPowerupType() == PowerupType.Turtle) {
         
        var turtlePowerup = (characterStatusEffect.Powerup as TurtlePowerup);
        damage *= turtlePowerup.GetDamageMultiplier();
    
        //Debug.Log("TurtlePowerup modified damage to: " + damage);
    }
    
    // check to see if attacker has any powerups that augment this player
    var launchingPlayer = GetLaunchingPlayer(attacker);
    if (launchingPlayer) {
  
        var launchingPlayerStatusEffect = ComponentUtil.GetComponentInHierarchy(launchingPlayer, typeof(CharacterStatusEffect)) as CharacterStatusEffect;
        if (launchingPlayerStatusEffect &&
            launchingPlayerStatusEffect.Powerup &&
            launchingPlayerStatusEffect.Powerup.GetPowerupType() == PowerupType.Crazy) {
        
            // attacker has powerup which flips this character's movement direction
            if (characterStatusEffect) {
                var crazyPowerup = (launchingPlayerStatusEffect.Powerup as CrazyPowerup);
                characterStatusEffect.DirectionFlipTimeRemaining = crazyPowerup.GetDirectionFlipTime();
            }
                                
        }
    
    }
        
    health -= damage;
    Debug.Log("Health is now " + health);

    if (health <= 0) {
        // probably not the right way to handle death, but works for now.
        Die(damage,attacker);
    }
}

function Die(damage: int, attacker : GameObject) {
   
    // before dying, drop any powerups at this position
    if (characterStatusEffect &&
        characterStatusEffect.Powerup) {
        characterStatusEffect.Powerup.DropPowerup(character.transform.position);
    }

    var network = ComponentUtil.GetComponentInHierarchy(gameObject,CharacterNetwork);
    if (network != null) {
        if(Network.connections.Length > 0 && gameObject.networkView != null) {
            var ownerNetViewID : NetworkViewID;
            var projectile: Weapon = ComponentUtil.GetComponentInHierarchy(attacker,typeof(Weapon)) as Weapon;
            if (projectile) {
            	ownerNetViewID = projectile.GetOwnerNetworkID();
            } else {
				var ownerCN : CharacterNetwork = ComponentUtil.GetComponentInHierarchy(attacker, typeof(CharacterNetwork)) as CharacterNetwork;
				if (ownerCN) {
					ownerNetViewID = ownerCN.networkView.viewID;
				}
            }
            network.gameObject.networkView.RPC("DieRemote", 
                                        RPCMode.AllBuffered,
                                        Network.player, 
                                        
                                        gameObject.transform.root.position,
                                        gameObject.transform.root.rotation, 
                                        damage,
                                        attacker.transform.position, 
                                        ownerNetViewID);        
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
    	//Reset health when player respawns, not when player dies
        //ResetHealth();
        
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

function UpdateHealth() {

     // check to see if character has any powerups that augement health
     if (characterStatusEffect &&
         characterStatusEffect.Powerup &&
         characterStatusEffect.Powerup.GetPowerupType() == PowerupType.Health) {
         
         var healthPowerup = (characterStatusEffect.Powerup as HealthPowerup);
         health += healthPowerup.GetHealthRegen(Time.deltaTime);
         health = Mathf.Min(GetMaxHealth(), health);
         
         //Debug.Log("HealthPowerup updated health to: " + health);
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

function Invincible(){
    invincible = true;
    Invoke("RemoveInvincible", 30);
}

function RemoveInvincible(){
    invincible = false;
}

private function GetLaunchingPlayer(attacker : GameObject) {

    var projectile: Weapon = ComponentUtil.GetComponentInHierarchy(attacker,typeof(Weapon)) as Weapon;
    if (projectile) {
        return projectile.launchingPlayer;
    }
    
    return null;

}

