#pragma strict

class RabbitMode extends GameMode {
    private var flag: RabbitFlag;
    private var rabbitHolderNetPlayer: NetworkPlayer;
    private var prevRabbitHolderNetPlayer: NetworkPlayer;
    private var rabbitHolderNetViewID: NetworkViewID;
    private var scoreboard: Scoreboard;
    
    // gets the RabbitFlag component
    public function get Flag() : RabbitFlag {
        return flag;
    }
    
    // sets the RabbitFlag component
    public function set Flag(value : RabbitFlag) {
        flag = value;
    }
    
    // gets the current NetworkPlayer that is holding the rabbit
    public function get CurrentHolder() : NetworkPlayer {
    	return rabbitHolderNetPlayer;
    }

	function syncClientsWithFlag() {
		if(flag.PickedUp) {
			flag.networkView.RPC("Pickup", RPCMode.All, rabbitHolderNetViewID);
		} else {
			flag.networkView.RPC("syncPosition", RPCMode.All, flag.transform.position);
		}
	}

    function playerPickedUpFlag(netPlayer: NetworkPlayer, netViewID: NetworkViewID) {
        Debug.Log(netViewID + " currently has the flag");
        rabbitHolderNetPlayer = netPlayer;
        rabbitHolderNetViewID = netViewID;
        
        if(Network.isServer) {
	        // send the updated flag state to all of the players
	        
	        if(scoreboard == null) {
	        	var scoreboardGO : GameObject = GameObject.Find("Scoreboard(Clone)");
    			scoreboard = scoreboardGO.GetComponent(Scoreboard);
	        }
	        
            if(scoreboard != null) {
                scoreboard.ChangeFlagState(rabbitHolderNetPlayer, true);
                StartCoroutine("generatePlayerScore");
            }
        }
    }
    
    function generatePlayerScore() {
    	Debug.Log("Generating player score for player " + rabbitHolderNetPlayer);
    
    	while(true) {
    		yield WaitForSeconds(3);
    		
    		if(scoreboard == null) {
    			var scoreboardGO : GameObject = GameObject.Find("Scoreboard(Clone)");
    			scoreboard = scoreboardGO.GetComponent(Scoreboard);
    		}
    		
    		if(rabbitHolderNetPlayer != null) {
    			scoreboard.AddPlayerScore(rabbitHolderNetPlayer, 1);
			}
    	}
    }
    
    function calculateScoreFromKill(killedPlayer: NetworkPlayer) : int {
    	if(prevRabbitHolderNetPlayer == rabbitHolderNetPlayer && rabbitHolderNetPlayer == killedPlayer) {
    		rabbitHolderNetPlayer = Network.player;
    		return 5;
    	} else {
    		return 2;
    	}
    }
    
	function playerDroppedFlag() {
		prevRabbitHolderNetPlayer = rabbitHolderNetPlayer;
	
        // send the updated flag state to all of the players
        var scoreboardGO : GameObject = GameObject.Find("Scoreboard(Clone)");
        if(scoreboardGO != null) {
            var scoreboard : Scoreboard = scoreboardGO.GetComponent(Scoreboard);
            if(scoreboard != null) {
                scoreboard.ChangeFlagState(rabbitHolderNetPlayer, false);
            }
        }
        
        StopCoroutine("generatePlayerScore");
    }

    function OnPlayerDeath(player: NetworkPlayer) {
        super(player);
        Debug.Log("Is player " + player + " the rabbit holder " + rabbitHolderNetPlayer);
        if(player == rabbitHolderNetPlayer) {
            flag.networkView.RPC("Drop", RPCMode.Others, false);
            //flag.DropFromHolder();
            //flag.Invoke("DropFromHolder", 2);
            
            if(Network.isServer) {
            	playerDroppedFlag();
            }
        }
    }

	function OnPlayerConnected(player: NetworkPlayer ) {
		Debug.Log("Player " + player + " connected.. Syncing Rabbit state with new player..");
		syncClientsWithFlag();
	}

    function OnPlayerDisconnected(player: NetworkPlayer) {
        Debug.Log("Player " + player + " disconnected, rabbit holder is " + rabbitHolderNetPlayer);
        if(player == rabbitHolderNetPlayer) {
            flag.networkView.RPC("Drop", RPCMode.All, true);
            
            if(Network.isServer) {
            	playerDroppedFlag();
            }
        }
    }
}
