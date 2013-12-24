#pragma strict
public var color : DoorColor;

function Start () {
}

function Update () {
}

function OnTriggerStay  (player : Collider) {
    
    var playerChar = player.gameObject.GetComponent(typeof(PlayerCharacter));
    if ( playerChar && playerChar.keyInventory && playerChar.keyInventory.hasKey(color) ) {
        this.collider.enabled = false;
    }
}

