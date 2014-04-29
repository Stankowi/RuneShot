#pragma strict

// enums
public enum PowerupType {
    Damage,
    Health,
    Speed,
    Turtle,
    Crazy
}

// public members
public var characterParticleEffect : GameObject;

// protected members
protected var powerupType : PowerupType;

// private members
private var lastPickupPlayer : CharacterStatusEffect;
private var assignedCharacter : CharacterStatusEffect;
private var bouncer : Bouncer;
private var nextPickupDelay : float = 0.0f;

// getters
function GetPowerupType() {
    return powerupType;
}

// operations
function Start () {
   
   lastPickupPlayer = null;
   assignedCharacter = null;

   bouncer = GetComponent(Bouncer);   
   if (!bouncer) {
       Debug.LogError("Bouncer not found");
   }
 
}

function OnPlayerConnected (player : NetworkPlayer) {

    // When a new player joins we need to make them aware of the state of this powerup. The
    // powerup could be in one of two states:
    //    1) owned by another player (assigned) or
    //    2) unowned and awaiting pickup
    //
    // In either case, make an RPC call to the newly joined player so they can sync their
    // Powerup state accordingly. Every Powerup does this independently. 
    
    if (assignedCharacter &&
        assignedCharacter.Powerup &&
        assignedCharacter.Powerup == this) {
    
        var playerNetworkView = assignedCharacter.transform.parent.gameObject.GetComponentInChildren(NetworkView);
        this.networkView.RPC("AttachToNetworkPlayer", player, playerNetworkView.viewID);
        Debug.Log("New player joined. Attaching Powerup: " + this.GetPowerupType() +
                  " to player network id: " + playerNetworkView.viewID); 

    } else {
    
        this.networkView.RPC("SyncPosition", player, this.transform.position, this.bouncer.StartingPosition);
        Debug.Log("New player joined. Placing Powerup: " + this.GetPowerupType() +
                  " at position: " + this.transform.position);
    
    }
    
}

@RPC
function SyncPosition (position : Vector3, startingPosition : Vector3) {

    // simulate a "drop" at this position which will
    // enable orb rendering and move the particle effects
    DetachFromPlayer(position);
    
    // correct the bouncer so that Powerups do not continue to
    // translate higher and higher in the world space
    if (bouncer) {
        bouncer.StartingPosition = startingPosition;
    }

}

function OnTriggerEnter (collision : Collider) {
    
    var other: GameObject = collision.gameObject;
    if (other.tag == "Player" || other.tag == "NPC") {
       
        // The code below prevents two things from occurring:
        //     1) a player who just dropped the powerup from picking it up immediately
        //     2) a player who dies from picking up the powerup upon respawn
        var playerPickingUp = collision.gameObject.GetComponentInChildren(CharacterStatusEffect);
        if (lastPickupPlayer != null && lastPickupPlayer == playerPickingUp) {
            lastPickupPlayer = null;
            return;
        }
       
        // drop existing powerup (if any) and then pickup this one
        if (playerPickingUp &&
            playerPickingUp.Powerup) {
            playerPickingUp.Powerup.DropPowerup(collision.gameObject.transform.position);
        }
    
        PickupPowerup(collision);
        
    }

}

function PickupPowerup (collision : Collider) {

    lastPickupPlayer = collision.gameObject.GetComponentInChildren(CharacterStatusEffect);

    // We branch here to allow both local, remote and NPC characters to pickup Powerups.
    var playerNetworkView = collision.gameObject.GetComponentInChildren(NetworkView);
    if (Network.connections.Length > 0) {
        this.networkView.RPC("AttachToNetworkPlayer", RPCMode.All, playerNetworkView.viewID);
    } else {
        AttachToPlayer(playerNetworkView);
    }
    
}

@RPC
function AttachToNetworkPlayer(playerNetworkViewID : NetworkViewID) {

    var playerNetworkView = NetworkView.Find(playerNetworkViewID);
    AttachToPlayer(playerNetworkView);

}

function AttachToPlayer (playerNetworkView : NetworkView) {

    if (playerNetworkView) {
        
        // assign to character
        assignedCharacter = playerNetworkView.transform.root.GetComponentInChildren(CharacterStatusEffect);
        assignedCharacter.Powerup = this;

        // disable rendering and collisions
        this.collider.enabled = false;
        this.RenderingEnabled(false);
  
        // assign particle effect to character
        characterParticleEffect.transform.position = playerNetworkView.transform.root.position;
        characterParticleEffect.transform.parent = playerNetworkView.transform.root;
        
        Debug.Log("Picked up powerup: " + this.GetPowerupType());

    }

}

function DropPowerup (position : Vector3) {

    if (Network.connections.Length > 0) {
        this.networkView.RPC("DetachFromPlayer", RPCMode.All, position);
    } else {
        DetachFromPlayer(position);
    }
    
}
 
@RPC
function DetachFromPlayer(position : Vector3) {

    // release from character - can be null when new players join
    // and are notified to position Powerup when syncing state
    if (assignedCharacter) {
        assignedCharacter.Powerup = null;
    }
 
    // place orbs at this drop position
    this.transform.position = position + Vector3.up;
    this.RenderingEnabled(true);
    Invoke("EnableCollider", nextPickupDelay); // prevent picking up right away
    
    // assign particle effect back to orbs
    characterParticleEffect.transform.position = this.transform.position;
    characterParticleEffect.transform.parent = this.transform;

    // reset bounce state
    if (bouncer) {
        bouncer.StartingPosition = this.transform.position;
    }
    
    Debug.Log("Dropped powerup: " + this.GetPowerupType());

}

private function EnableCollider() {
    this.collider.enabled = true;
}

private function RenderingEnabled(enabled : boolean) {

    var renderers = this.GetComponentsInChildren(MeshRenderer);
    for (var i = 0; i < renderers.length; i++) {
        var renderer : MeshRenderer = renderers[i];
        renderer.enabled = enabled;
    }

}