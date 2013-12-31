#pragma strict
public var color : DoorColor;

function Start () {

}

function Update () {

}

function OnTriggerEnter (player : Collider) {
    
    var networkChar = ComponentUtil.GetComponentInHierarchy(player.gameObject,typeof(CharacterNetwork)) as CharacterNetwork;
    var intColor : int = color;
    if ( networkChar && networkChar.keyInventory ) {
    
        if ( networkChar.IsSinglePlayer()) {
            networkChar.keyInventory.addKey( color );
        } else {
            networkChar.networkView.RPC ("AddKeyServer", RPCMode.Server, Network.player, intColor );
        }
    }
}