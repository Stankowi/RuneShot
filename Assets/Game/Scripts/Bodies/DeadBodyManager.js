#pragma strict
import System.Collections.Generic;

static var maxBodyCount : float = 10;
static var bodyList : List.<GameObject> = new List.<GameObject>();

static function SpawnRagdoll(transform : Transform, damage: int, attacker : GameObject) {
    RestrictBodyCount();
    var ragdollExplosionMaxStrength : float = 24000;
    var ragdollExplosionRadius : float = 6;
    var explosionPercent = (parseFloat(damage))/(Base.health());
    var ragdoll : GameObject = GameObject.Instantiate(Resources.Load("Characters/Ragdoll"),
                                                    transform.root.position,
                                                    transform.root.rotation) as GameObject;
    bodyList.Add(ragdoll);
    
    if(ragdoll != null && ragdoll.rigidbody != null) {
        ragdoll.rigidbody.AddExplosionForce(ragdollExplosionMaxStrength * explosionPercent,
                                            attacker.transform.position,
                                            ragdollExplosionRadius);
    }
}

private static function RestrictBodyCount() {
    while(bodyList.Count >= maxBodyCount) {
        if(bodyList[0] != null) {
            GameObject.Destroy(bodyList[0]);
        }
        bodyList.RemoveAt(0);
    }
}