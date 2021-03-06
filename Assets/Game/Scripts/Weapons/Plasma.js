﻿var secondaryProjectile: Transform;

class Plasma extends Weapon {
    private var collisions: int = 0;
    private var explodeAt: int = 0;
    private var triggered: boolean = false;

    private var explosionEffect: String = "Particles/SimpleParticlePack/Resources/Explosions/Ring";
    
    private var gunModel: String = "Guns/OutPost/msr";
    private var gunOffset: Vector3 = Vector3(.35, -.3, .31);
    private var gunRotation: Quaternion = Quaternion.Euler(-90.0, -90.0, 0);
    private var projOffset: Vector3 = Vector3(0, 0, 0);
    
    var normalDamage: int = 30;
    var critDamage: int = 85;
    var damageRadius: float = 1.25;
    
    var SecondaryFireCoolDown: int = 5;
    var SecondaryFireAvailable: boolean = true;
    
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

    function Update() {
        if (triggered)
        {
            Explode();
        }
    }

    function OnCollisionEnter(collision: Collision) {
        var other: GameObject = collision.gameObject;
        if ((other.tag == "Player" || other.tag == "NPC") && (collisions > 0 ||
                                      (collisions <= 0 && !IsLauncher(other)))) {
            transform.parent = other.transform;
            collider.enabled = false;
            triggered = true;
        }
        else {
            collider.enabled = false;
            
            triggered = true;
        }

        collisions += 1;
    }

    function IsLauncher(obj: GameObject): boolean {
        return obj.GetInstanceID() == this.launchingPlayer.GetInstanceID();
    }

     function Explode() { 
        NetworkUtil.Instantiate(Resources.Load(explosionEffect),transform.position,Quaternion.identity,NetworkGroup.Explosion);
         
        var damageRadius: int = GetDamageRadius();

        var colliders: Collider[] = Physics.OverlapSphere(transform.position, damageRadius);

        var damage: int = 0;
        for(var hit in colliders) {
           if((hit.gameObject.tag == "NPC" || hit.gameObject.tag == "Player") && !IsLauncher(hit.gameObject)) {
           	   damage = GetDamage(IsCriticalHit(hit));
           	   Debug.Log("Damage: " + damage);
               ComponentUtil.GetComponentInHierarchy(hit.gameObject,"Health").ResolveDamage(damage, gameObject);
               break;
           }
        }
         
        Destroy(gameObject);
     }

    function Trigger(launchingPlayer: GameObject, facing: Vector3, pressDuration: int) {
        this.launchingPlayer = launchingPlayer;
        gameObject.transform.forward = facing;

        rigidbody.useGravity=false;
        rigidbody.AddRelativeForce(Vector3(0,0,3000));
        
        // The grenade should not collide with the player that spawns it until it is safely outside that player.
        // The easiest way to accomplish this is to tell Physics to ignore collision between the player and the grenade.
        if (launchingPlayer.collider != null) {
            Physics.IgnoreCollision(launchingPlayer.collider,gameObject.collider);
        }
    }
    
    function SecondaryTrigger(launchingPlayer: GameObject, position: Vector3, facing: Vector3) {
        if(SecondaryFireAvailable) {
            SecondaryFireAvailable = false;
            Invoke("EnableSecondaryFire", SecondaryFireCoolDown);
	        var rot = Quaternion.FromToRotation(Camera.main.transform.forward, facing);
	        this.launchingPlayer = launchingPlayer;
	        projectile = NetworkUtil.Instantiate(secondaryProjectile, position, rot, NetworkGroup.CharacterNetwork);
	        projectile.transform.forward = facing;
	        
	        projectile.rigidbody.AddRelativeForce(Vector3(0,0,1000));
	        
	        if (launchingPlayer.collider != null) {
	            Physics.IgnoreCollision(launchingPlayer.collider,projectile.collider);
	        }
        }
    }
    
    function EnableSecondaryFire() {
        SecondaryFireAvailable = true;
    }
}