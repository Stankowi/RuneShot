#pragma strict
public var color : DoorColor;

function Start () {

}

function Update () {

}

function OnTriggerEnter (player : Collider) {
    
    var playerChar = ComponentUtil.GetComponentInHierarchy(player.gameObject,typeof(PlayerCharacter)) as PlayerCharacter;
    if ( playerChar && playerChar.keyInventory ) {
        playerChar.keyInventory.addKey( color );
    }
}