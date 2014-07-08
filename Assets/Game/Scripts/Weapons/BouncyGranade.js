class BouncyGranade extends Weapon {
    private static var ttl: int = 2;

    private var collisions: int = 0;
    private var explodeAt: int = 0;
    private var triggered = false;

    private var explosionEffect: String = "Particles/Explosion"; 
    
    private var gunModel: String = "Bazooka/prefabs/bazooka";
    private var gunOffset: Vector3 = Vector3(.23,-.12,.4);
    private var gunRotation: Quaternion = Quaternion.Euler(0.0, 90.0, 0.0);
    private var projOffset: Vector3 = Vector3(0,0,.4);
    
    var normalDamage: int = 25;
    var critDamage: int = 25;
    var damageRadius: float = 2.0;
     
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

    function Start() {
        explodeAt = Time.time + ttl;
    }

    function Update() {
        if (explodeAt < Time.time) {
            Explode();
        }
    }

    function OnCollisionEnter(collision: Collision) {
        if(!triggered) {
            return;
        }
        var other: GameObject = collision.gameObject;
        if ((other.tag == "Player" || other.tag == "NPC") && (collisions > 0 || (collisions <= 0 && !IsLauncher(other)))) {
            transform.parent = other.transform;
            collider.enabled = false;
            GameObject.Destroy(rigidbody);
        }
        else {
            // Grenades should collide with the player that spawned them.
            // However, when spawning the grenade, it should not collide with the player.
            // After the first collision with the world, the grenade needs to stop ignoring
            // the player that spawned it, so it can collide with that player again.
            // There is no "renableCollision" for two colliders, so the only way to
            // allow the grenade to collide with its owner again is to re-insert it into the simulation.
            collider.enabled = false;
            collider.enabled = true;
        }

        collisions += 1;
    }

    function IsLauncher(obj: GameObject): boolean {
        return obj.GetInstanceID() == this.launchingPlayer.GetInstanceID();
    }

    function GetDamage(isCritical: boolean): int {
        return Base.health()  * 0.25;
    }

     function Explode() { 
         NetworkUtil.Instantiate(Resources.Load(explosionEffect),transform.position,Quaternion.identity,NetworkGroup.Explosion);
         
        var damageRadius: int = GetDamageRadius();

        var colliders: Collider[] = Physics.OverlapSphere(transform.position, damageRadius);

         var damage: int = 0;
         for(var hit in colliders) {
            var h = ComponentUtil.GetComponentInHierarchy(hit.gameObject, "Health");
            if (h != null) {
                damage = GetDamage(IsCriticalHit(hit));
                h.ResolveDamage(damage, gameObject);
            }
         }
         
        Destroy(gameObject);
     }

    function Trigger(launchingPlayer: GameObject, facing: Vector3, pressDuration: int) {
        triggered = true;
        this.launchingPlayer = launchingPlayer;

        gameObject.transform.forward = facing;
        rigidbody.AddRelativeForce(Vector3(0,0,1000));
        // The grenade should not collide with the player that spawns it until it is safely outside that player.
        // The easiest way to accomplish this is to tell Physics to ignore collision between the player and the grenade.
        Physics.IgnoreCollision(launchingPlayer.collider,gameObject.collider);
    }
    
    function SecondaryTrigger(position: Vector3, facing: Vector3) {
        return null;
    }
}