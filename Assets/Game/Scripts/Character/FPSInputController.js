private var motor : CharacterMotor;
private var characterStatusEffect : CharacterStatusEffect;

// Use this for initialization
function Awake () {
	motor = GetComponent(CharacterMotor);
}

function Start() {
	characterStatusEffect = ComponentUtil.GetComponentInHierarchy(gameObject, CharacterStatusEffect);
}

// Update is called once per frame
function Update () {

	// Get the input vector from keyboard or analog stick
	var directionVector = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
	
	if (directionVector != Vector3.zero) {
		// Get the length of the directon vector and then normalize it
		// Dividing by the length is cheaper than normalizing when we already have the length anyway
		var directionLength = directionVector.magnitude;
		directionVector = directionVector / directionLength;
		
		// character status effects may modify direction vector
		directionVector *= GetDirectionModifier();
		
		// Make sure the length is no bigger than 1
		directionLength = Mathf.Min(1, directionLength);
		
		// Make the input vector more sensitive towards the extremes and less sensitive in the middle
		// This makes it easier to control slow speeds when using analog sticks
		directionLength = directionLength * directionLength;
		
		// Multiply the normalized direction vector by the modified length
		directionVector = directionVector * directionLength;
	}
	
    // Apply the direction to the CharacterMotor
	motor.inputMoveDirection = transform.rotation * directionVector * GetSpeedMultiplier();
	motor.inputJump = Input.GetButton("Jump");
    
    var wpns = ComponentUtil.GetComponentInHierarchy(gameObject,Weapons);
    if (wpns != null) {
    
        if (Input.GetKeyDown(KeyCode.LeftControl) || Input.GetMouseButtonDown(0)) {
            wpns.StartPowerCalc();
        }

        if (Input.GetKeyUp(KeyCode.LeftControl) || Input.GetMouseButtonUp(0)) {
            wpns.EndPowerCalc();
        }
        
        if (Input.GetKeyUp(KeyCode.F)) {
            wpns.ToggleWeapon();
        }
    }
}

private function GetSpeedMultiplier() {

    // check to see if a powerup augments the multiplier
    if (characterStatusEffect &&
        characterStatusEffect.Powerup &&
        characterStatusEffect.Powerup.GetPowerupType() == PowerupType.Speed) {
                
        var speedPowerup = (characterStatusEffect.Powerup as SpeedPowerup);
        var speedMultiplier = speedPowerup.GetSpeedMultiplier();
        
        //Debug.Log("SpeedPowerup applied speedMultiplier: " + speedMultiplier);
        
        return speedMultiplier;
     }
     
     if (characterStatusEffect &&
         characterStatusEffect.Powerup &&
         characterStatusEffect.Powerup.GetPowerupType() == PowerupType.Turtle) {
                
        var turtlePowerup = (characterStatusEffect.Powerup as TurtlePowerup);
        speedMultiplier = turtlePowerup.GetSpeedMultiplier();
        
        //Debug.Log("TurtlePowerup applied speedMultiplier: " + speedMultiplier);
        
        return speedMultiplier;
     }
     
     // no powerups found - return default
     return 1.0f;
}

private function GetDirectionModifier() {

    // check to see if this character has a direction modifier status
    if (characterStatusEffect &&
        characterStatusEffect.DirectionFlipTimeRemaining > 0.0f) {
        return -1.0f;
    }
    
    // no status effect found - return default
    return 1.0f;
}

// Require a character controller to be attached to the same game object
@script RequireComponent (CharacterMotor)
@script AddComponentMenu ("Character/FPS Input Controller")
