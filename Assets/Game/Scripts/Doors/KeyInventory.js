
private var keys: boolean[];
var redKeyTex: Texture2D;
var blueKeyTex: Texture2D;
var yellowKeyTex: Texture2D;

function hasKey(color : DoorColor) : boolean {
    return keys[color];
}

function addKey(color : DoorColor) {
    keys[color] = true;
}

function clearKeys() {
	if(keys) {
	    for( var i = 0; i < keys.Length; ++i ){
	        keys[i] = false;
	    }
    }
}

// Use this for initialization
function Start () {
    keys = new boolean[ System.Enum.GetValues( DoorColor ).Length];
    clearKeys();
}

// Update is called once per frame
function Update () {
}

function OnGUI () {

    var keyWidth = 64;
    var keyHeight = 64;
    var margin = 10;
    
    var titleWidth = (keyWidth*3+margin*3);
    var titleHeight = 30;
    var y = titleHeight*2 + margin;
    
    if( keys[DoorColor.Red] ) {
    
        GUI.DrawTexture(Rect(Screen.width-(keyWidth*3+margin*3),y,keyWidth,keyHeight), redKeyTex);
    }
    
    if( keys[DoorColor.Blue] ) {
        GUI.DrawTexture(Rect(Screen.width-(keyWidth*2+margin*2),y,keyWidth,keyHeight), blueKeyTex);
    }
    
    if( keys[DoorColor.Yellow] ) {
        GUI.DrawTexture(Rect(Screen.width-(keyWidth*1+margin*1),y,keyWidth,keyHeight), yellowKeyTex);
    }
    
    GUI.Box(Rect(Screen.width-titleWidth,titleHeight,Screen.width/5,titleHeight),"KeyInventory");
}