#pragma strict
import System.Collections.Generic;

static var maxBodyCount : float = 10;
static var bodyList : List.<GameObject> = new List.<GameObject>();

static function SpawnRagdoll(position : Vector3, rotation : Quaternion, damage: int, attackerPosition : Vector3) {
    RestrictBodyCount();
    var ragdollExplosionMaxStrength : float = 24000;
    var ragdollExplosionRadius : float = 6;
    var explosionPercent = (parseFloat(damage))/(Base.health());
    var ragdoll : GameObject = GameObject.Instantiate(Resources.Load("Characters/Ragdoll"),
                                                    position,
                                                    rotation) as GameObject;
    bodyList.Add(ragdoll);
    
    if(ragdoll != null && ragdoll.rigidbody != null) {
        ragdoll.rigidbody.AddExplosionForce(ragdollExplosionMaxStrength * explosionPercent,
                                            attackerPosition,
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