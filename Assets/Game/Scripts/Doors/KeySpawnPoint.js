#pragma strict
public var color : DoorColor;

function Start () {

}

function Update () {

}

function OnTriggerEnter (player : Collider) {
    
    var playerChar = player.gameObject.GetComponent(typeof(PlayerCharacter));
    if ( playerChar && playerChar.keyInventory ) {
        playerChar.keyInventory.addKey( color );
    }
}