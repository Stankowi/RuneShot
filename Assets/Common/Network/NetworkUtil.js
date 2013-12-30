#pragma strict

public static function Instantiate(prefab: UnityEngine.Object, position: Vector3, rotation: Quaternion, group: NetworkGroup) {
     if(Network.connections.Length > 0) {
        return Network.Instantiate(prefab,position,rotation,group);
     }
     else {
        return GameObject.Instantiate(prefab,position,rotation);
     }
}

