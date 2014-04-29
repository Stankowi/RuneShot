class Weapon extends MonoBehaviour {
    public var launchingPlayer: GameObject = null;
    
    private var gun: GameObject; 
    private var gunModel: String = "";
    private var gunOffset: Vector3 = Vector3(0,0,0);
    private var gunRotation: Quaternion = Quaternion.Euler(0.0, 0.0, 0.0);
    private var projOffset: Vector3 = Vector3(0,0,0);
    var criticalHitPercent: float = .3;
    private var normalDamage: int = 0;
    private var critDamage: int = 0;
    private var damageRadius: float = 1.0;
    private var bobbingAnimation: Animation;
    private var weaponBobAnimationClip: AnimationClip;
    
    function GetOwnerNetworkID(): NetworkViewID {
        var networkID: NetworkViewID;
        var networkChar = ComponentUtil.GetComponentInHierarchy(launchingPlayer,typeof(CharacterNetwork)) as CharacterNetwork;
        if (networkChar != null){
            networkID = networkChar.networkView.viewID;
        }
        
        return networkID;
    }
    
    function GetModelLoc() {
		return gunModel;
	}
	
	function GetGunOffset() {
		return gunOffset;
	}
	
	function GetGunRotation() {
		return gunRotation;
	}
	
	function GetProjectileOffset() {
		return projOffset;
	}
	
	function GetNormalDamage() {
        return normalDamage;
    }
    
    function GetCritDamage() {
        return critDamage;
    }
    
    function GetDamageMultiplier() {
    
        // check to see if a powerup augments the multiplier
        if (launchingPlayer) {
        
            var characterStatusEffect = launchingPlayer.gameObject.GetComponentInChildren(CharacterStatusEffect);
            if (characterStatusEffect &&
                characterStatusEffect.Powerup &&
                characterStatusEffect.Powerup.GetPowerupType() == PowerupType.Damage) {
                
                var damagePowerup = (characterStatusEffect.Powerup as DamagePowerup);
                var damageMultiplier = damagePowerup.GetDamageMultiplier();
                
                //Debug.Log("DamagePowerup applied damageMultiplier: " + damageMultiplier);
                
                return damageMultiplier;

            }
        }

        // no powerups found - return default     
        return 1.0;
        
    }
    
    function GetDamageRadius() {
        return damageRadius;
    }
    
    function CreateModel() {
    	var currentModel = Camera.main.transform.Find("WeaponModel");
    	if (currentModel != null) {
    		Destroy(currentModel.gameObject);
    	}
   		var cam = Camera.main;
	    var gunPrefab = Resources.Load(GetModelLoc(), GameObject);
        weaponBobAnimationClip = Resources.Load("Guns/WeaponBob",AnimationClip);
	   	
        gun = GameObject.Instantiate(gunPrefab, cam.transform.position, Quaternion(0.0, 0.0, 0.0, 0.0));
        gun.AddComponent("Animation");
        gun.name = "WeaponModel";
        gun.transform.parent = cam.transform;
        gun.transform.localPosition = GetGunOffset();
        gun.transform.localRotation = GetGunRotation();
        gun.animation.AddClip(weaponBobAnimationClip, "WeaponBob");
        return gun;
    }
    
    function GetProjectileOrigin(): Vector3 {
    	var gun = Camera.main.transform.Find("WeaponModel");
        weaponPos = gun.transform.position + GetProjectileOffset().z * Camera.main.transform.forward + GetProjectileOffset().x * Camera.main.transform.right;
        return weaponPos;
    }
    
    function IsCriticalHit(hit: Collider): boolean {
        var bounds = hit.bounds;
    	var bottom = bounds.center.y - bounds.extents.y;
    	var localY = gameObject.transform.position.y - bottom;
    	
    	//see if we are hitting in the head region
    	if (localY >  (bounds.extents.y * 2)*(1-criticalHitPercent)) {
    		return true;
    	} else {
    		return false;
    	}
    }
    
    function GetDamage(isCritical: boolean): int {
    	if (isCritical) {
    		return GetCritDamage() * GetDamageMultiplier();
    	} 
    	
    	return GetNormalDamage() * GetDamageMultiplier();
    }
}
