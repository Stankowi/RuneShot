class Weapon extends MonoBehaviour {
    public var launchingPlayer: GameObject = null;
    
    private var gunPrefab: GameObject; 
    private var gunModel: String = "";
    private var gunOffset: Vector3 = Vector3(0,0,0);
    private var gunRotation: Quaternion = Quaternion.Euler(0.0, 0.0, 0.0);
    private var projOffset: Vector3 = Vector3(0,0,0);
    var criticalHitPercent: float = .3;
    private var normalDamage: int = 0;
    private var critDamage: int = 0;
    private var damageRadius: float = 1.0;
    
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
    
    function GetDamageRadius() {
        return damageRadius;
    }
    
    function CreateModel() {
    	var currentModel = Camera.main.transform.Find("WeaponModel");
    	if (currentModel != null) {
    		Destroy(currentModel.gameObject);
    	}
   		var cam = Camera.main;
	    gunPrefab = Resources.Load(GetModelLoc(), GameObject);
	   	var gun = GameObject.Instantiate(gunPrefab, cam.transform.position, Quaternion(0.0, 0.0, 0.0, 0.0));
	   	gun.name = "WeaponModel";
	    gun.transform.parent = cam.transform;
	    gun.transform.localPosition = GetGunOffset();
	    gun.transform.localRotation = GetGunRotation();
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
    		return GetCritDamage();
    	} 
    	
    	return GetNormalDamage();
    }
 
}
