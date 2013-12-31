#pragma strict
public var color : DoorColor;

function Start () {
}

function Update () {
}

function OnTriggerStay  (player : Collider) {
    
    var playerChar = ComponentUtil.GetComponentInHierarchy(player.gameObject,typeof(PlayerCharacter)) as PlayerCharacter;
    if ( playerChar && playerChar.keyInventory && playerChar.keyInventory.hasKey(color) ) {
        this.collider.enabled = false;
    }
}

