#pragma strict


public var bounceSpeed : float;
public var bounceAmplitude : float;
public var bounceDirection : Vector3;

private var bounceCounter : float;
private var startingPosition : Vector3;

function Start () {
    startingPosition = this.transform.position;
    Debug.Log("Starting position: " + startingPosition);
}

function Update () {
    bounceCounter += bounceSpeed * Time.deltaTime;
    
    // calculate bounce offset
    var bounceX = Mathf.Sin(bounceCounter) * bounceAmplitude * bounceDirection.x;
    var bounceY = Mathf.Sin(bounceCounter) * bounceAmplitude * bounceDirection.y;  
    var bounceZ = Mathf.Sin(bounceCounter) * bounceAmplitude * bounceDirection.z;
    
    // apply offset to starting position
    this.transform.position = startingPosition + new Vector3(bounceX, bounceY, bounceZ);
                                                                           
}

public function set StartingPosition(value : Vector3) {
    startingPosition = value;
}

public function get StartingPosition() : Vector3 {
    return startingPosition;
}