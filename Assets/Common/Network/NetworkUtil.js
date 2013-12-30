#pragma strict

public static function Instantiate(prefab: UnityEngine.Object, position: Vector3, rotation: Quaternion, group: int) {

     //Network.Instantiate(Resources.Load("Particles/Explosion"),transform.position,Quaternion.identity,20);
     if(Network.connections.Length > 0) {
        return Network.Instantiate(prefab,position,rotation,group);
     }
     else {
        return GameObject.Instantiate(prefab,position,rotation);
     }
}

