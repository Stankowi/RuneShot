#pragma strict

public var invincibleCapsule : GameObject ;

function Start () {
    
}

function Update () {

}


function OnTriggerEnter (collision : Collider) {
    var other: GameObject = collision.gameObject;
    if ( other.tag == "Player" || other.tag == "NPC" ) {
        if (Network.connections.Length > 0) {
            networkView.RPC("HideInvincibleCapsule",
                    RPCMode.All
                    );
        }else{
            invincibleCapsule.active = false;
            invincibleCapsule.collider.isTrigger = false;
            Invoke("SpawnNewInvincibleCapsule",60);
        }
        
        //call player
        var health = ComponentUtil.GetComponentInHierarchy(collision.gameObject,typeof(Health)) as Health;
        health.Invincible();
        var health = ComponentUtil.GetComponentInHierarchy(collision.gameObject,typeof(Dude)) as Dude;
        Debug.Log("test");
        //collision.material.color = Color.red;
        
        
    }
}

@RPC
function HideInvincibleCapsule(){
        invincibleCapsule.active = false;
        invincibleCapsule.collider.isTrigger = false;
        Invoke("SpawnNewInvincibleCapsule",60);
}


function SpawnNewInvincibleCapsule(){
    Debug.Log("test again");
    invincibleCapsule.active = true;
    invincibleCapsule.collider.isTrigger = true;
}

