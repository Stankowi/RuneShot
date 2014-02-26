class Weapon extends MonoBehaviour {
    public var launchingPlayer: GameObject = null;
    
    function GetOwnerNetworkID(): NetworkViewID {
        var networkID: NetworkViewID;
        var networkChar = ComponentUtil.GetComponentInHierarchy(launchingPlayer,typeof(CharacterNetwork)) as CharacterNetwork;
        if (networkChar != null){
            networkID = networkChar.networkView.viewID;
        }
        
        return networkID;
    }
}
