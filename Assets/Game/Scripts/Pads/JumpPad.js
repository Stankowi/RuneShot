#pragma strict

public var boostAmount:float = 50.0f;
public var direction:Vector3 = new Vector3(0.0f,1.0f,0.0f);

function Start () {

}

function Update () {

}


function OnTriggerEnter  (player : Collider) {
    
    var networkChar = ComponentUtil.GetComponentInHierarchy(player.gameObject,typeof(CharacterNetwork)) as CharacterNetwork;
    if ( networkChar) 
    {
        var motor:CharacterMotor = player.GetComponent(CharacterMotor);
        if (motor) {
        	motor.SetVelocity (direction.normalized * boostAmount);
        }
    } 
}