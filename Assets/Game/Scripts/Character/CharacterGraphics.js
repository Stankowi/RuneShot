#pragma strict


@RPC
function attachCharacterNetwork(networkPlayer : NetworkPlayer) {
    var networks : CharacterNetwork [] = GameObject.FindObjectsOfType(CharacterNetwork);
    for(var network in networks) {
        if(network.networkPlayer == networkPlayer) {
            network.gameObject.transform.root.parent = transform.root;
        }
    }
}
