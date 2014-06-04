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

@RPC
function StartSendingInput(id : NetworkViewID) {
	var fps : FPSInputController = this.GetComponentInParent(FPSInputController) as FPSInputController;
	if (fps) {
		fps.StartSendingInput(NetworkView.Find(id));
	}
}

@RPC
function StopSendingInput(id : NetworkViewID) {
	var fps : FPSInputController = this.GetComponentInParent(FPSInputController) as FPSInputController;
	if (fps) {
		fps.StopSendingInput(NetworkView.Find(id));
	}
}
