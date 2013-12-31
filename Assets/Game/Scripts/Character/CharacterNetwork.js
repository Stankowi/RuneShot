#pragma strict

public var networkPlayer: NetworkPlayer;
public var localPlayer: GameObject;
public var keyInventory : KeyInventory;
private var networkManager: NetworkManager;

function Start() {
    networkManager = GameObject.FindObjectOfType(NetworkManager);
}

function IsSinglePlayer(): boolean {
    return networkManager.IsSinglePlayer();
}

@RPC
function SetPlayerData( player: NetworkPlayer ) {
    networkPlayer = player;
    
    if(player == Network.player) {
        var controller = Component.FindObjectOfType(CharacterController);
        localPlayer = controller.gameObject;
        transform.parent = localPlayer.transform;
        transform.localPosition = Vector3.zero;
        transform.localEulerAngles = Vector3.zero;
    }
}

@RPC
function AddKeyServer( player: NetworkPlayer, color: int ) {
    networkPlayer = player;
    
    // do validation here
    
    networkView.RPC ("AddKeyClient", RPCMode.Others, player, color );
}

@RPC
function AddKeyClient( player: NetworkPlayer, color: int ) {
    networkPlayer = player;
    
    if(player == Network.player) {
        var networkChar = Component.FindObjectOfType(CharacterNetwork);
        networkChar.keyInventory.addKey(color);
    }
}
