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
		
		// send the updated flag state to all of the players
		var scoreboardGO : GameObject = GameObject.Find("Scoreboard(Clone)");
        if(scoreboardGO != null) {
            var scoreboard : Scoreboard = scoreboardGO.GetComponent(Scoreboard);
            if(scoreboard != null) {
            	scoreboard.ChangeFlagState(rabbitHolderNetPlayer, true);
            }
        }
	}

	function OnPlayerDeath(player: NetworkPlayer) {
		super(player);
		if(player == rabbitHolderNetPlayer) {
			playerDroppedFlag();
		}
	}

	function OnPlayerDisconnected(player: NetworkPlayer) {
		Debug.Log("Player " + player + " disconnected");
		if(player == rabbitHolderNetPlayer) {
			playerDroppedFlag();
		}
	}
	
	function playerDroppedFlag() {
		// physically "drop" the flag
		flag.networkView.RPC("Drop", RPCMode.AllBuffered);
		
		// send the updated flag state to all of the players
		var scoreboardGO : GameObject = GameObject.Find("Scoreboard(Clone)");
        if(scoreboardGO != null) {
            var scoreboard : Scoreboard = scoreboardGO.GetComponent(Scoreboard);
            if(scoreboard != null) {
            	scoreboard.ChangeFlagState(rabbitHolderNetPlayer, false);
            }
        }
	}
}