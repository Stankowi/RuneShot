#pragma strict
public var color : DoorColor;

function Start () {
}

function Update () {
}

function OnTriggerStay  (player : Collider) {
    
    var networkChar = ComponentUtil.GetComponentInHierarchy(player.gameObject,typeof(CharacterNetwork)) as CharacterNetwork;
    if ( networkChar && networkChar.keyInventory && networkChar.keyInventory.hasKey(color) ) {
        this.collider.enabled = false;
    } else {
        this.collider.enabled = true;
    }
}

