
private var keys: boolean[];

function hasKey(color : DoorColor) : boolean {
    return keys[color];
}

function addKey(color : DoorColor) {
    keys[color] = true;
}

function clearKeys() {
     for( var i = 0; i < keys.Length; ++i ){
        keys[i] = false;
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

