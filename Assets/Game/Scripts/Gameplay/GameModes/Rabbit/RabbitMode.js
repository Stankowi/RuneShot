#pragma strict

class RabbitMode extends GameMode {
	private var flag: RabbitFlag;
	private var rabbitHolderNetPlayer: NetworkPlayer;
	private var rabbitHolderNetViewID: NetworkViewID;
	
	// gets the RabbitFlag component
	public function get Flag() : RabbitFlag {
		return flag;
	}
	
	// sets the RabbitFlag component
	public function set Flag(value : RabbitFlag) {
		flag = value;
	}

	function playerPickedUpFlag(netPlayer: NetworkPlayer, netViewID: NetworkViewID) {
		Debug.Log(netViewID + " currently has the flag");
		rabbitHolderNetPlayer = netPlayer;
		rabbitHolderNetViewID = netViewID;
	}

	function OnPlayerDeath(player: NetworkPlayer) {
		super(player);
		if(player == rabbitHolderNetPlayer) {
			flag.networkView.RPC("Drop", RPCMode.AllBuffered);
		}
	}

	function OnPlayerDisconnected(player: NetworkPlayer) {
		Debug.Log("Player " + player + " disconnected");
		if(player == rabbitHolderNetPlayer) {
			flag.networkView.RPC("Drop", RPCMode.AllBuffered);
		}
	}
}