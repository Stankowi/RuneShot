//AI to direct non player characters
// if no target, select target

enum Goal {
	Attack, //move towards target and shoot
	Flee,	//move away from hostile characters when low on health
	Evade	//dodge immediate danger, like a grenade
};

private var motor : CharacterMotor;
private var seeker: Seeker = null;
private var standTime: float = 0.0f;

//The entity this bot is tryingto kill
public var myTarget :  GameObject = null;

//The place this bot wants to be.
public var myDestination : Vector3;

//The path the NPC is following to reach its desired position.
public var myPath : Pathfinding.Path = null;
private var currentWayPoint: int = 0;

//When NPC is this close to a waypoint, start moving to the next waypoint.
private var nextWayPointDistance: float = 1.0f;

//Bot won't shoot if further than this
public var maxRange : double = 50.0f;

//Bot won't approach closer than this
public var minRange : double = 8.0f;

//Bot will move away if target gets closer than this
public var back0ffRange : double = 4.0f;

//Bot's current goal
private var myGoal : Goal;

//The weapons this bot is carrying
private var wpns;

private var myHealth : Health;

// Use this for initialization
function Awake () {
    motor = GetComponent(CharacterMotor);
    seeker = GetComponent(Seeker);
}

function Start() {
	chooseTarget();
    wpns = ComponentUtil.GetComponentInHierarchy(gameObject,Weapons);
	myHealth = ComponentUtil.GetComponentInHierarchy(gameObject,"Health") as Health;
		//NPC makes a choice once per second.
	//Update this rate as desired.
	InvokeRepeating("npc_Choose", 0, 1);
}

// The NPC's brain.
// Based on the NPC's status, choose the best action to take.
function npc_Choose() {
	if(myGoal == Goal.Evade) {
//		evade();
	} else if(false/*explosive nearby*/) {
		//BeginEvading();
	}
	
	if(myGoal == Goal.Flee) {
		//Flee();
	} else if (myHealth.GetHealth() < 40) {
		StartFleeing();
	}
	if(myGoal == Goal.Attack) {
		Attack();
	}
}

private function StartFleeing() {
	myGoal = Goal.Flee;
	//Run far away from the thing attacking you
	//WHo is attacking you?
	//Maybe avoid everyone.
	avoidObject(myTarget, 100.0f);
}

private function Flee() {
	//Is there anything to do here?
}

private function Attack() {

	//Store return values from behaviors here.
	var success : boolean = true;
	
	// NPC should have a target, a player it is trying to kill.
	//Is the current target dead?

    if(myTarget == null) {
    	success = chooseTarget();
    	if(!success) {
    		Debug.Log("Failed to pick a target", gameObject);
    		return;
		}
	} else {
		//TODO:  Is target dead?  If so, select a new target.
		
			var health : Health = ComponentUtil.GetComponentInHierarchy(myTarget, Health);
		if(health.GetHealth() <= 0) {
			Debug.Log("Target is dead.  Selecting new target.", gameObject);
			success = chooseTarget();
			if(!success) {
				Debug.Log("Failed to pick a target", gameObject);
				return;
			}
		}
	}


	//How far away is the target?
	//long range:  don't shoot.  move closer.
	//medium range: shoot.  move closer.
	//short range:  shoot.  Don't move.
	//backoff range:  don't shoot.  Move away.
	var rangeToTarget : double = Vector3.Distance(transform.position, myTarget.transform.position);
	if(rangeToTarget < maxRange && rangeToTarget >= back0ffRange) {
		success = shootAtTarget();
    	if(!success) {
    		Debug.Log("Failed to shoot at target", gameObject);
    		return;
		}
	}
	if(rangeToTarget >= minRange) {
		//recalculate path to target
		avoidObject(myTarget, minRange);
	} else {
		if(rangeToTarget < back0ffRange) {
			//if target gets too close, back off.
			avoidObject(myTarget, back0ffRange);
		}
	}
}

//Fire current weapon at current target
private function shootAtTarget() : boolean {
    var weaponPos = transform.position + Vector3(0,1,0);
	//Get direction to target
	var vectorToTarget = myTarget.transform.position - transform.position;
	//TODO: Add some inaccuracy
	//Fire weapon
	wpns.Trigger(wpns.GetCurrentWeaponListKey(), weaponPos, vectorToTarget.normalized, 0);
	return true;
}

// Update is called once per physics update
// Move along a path.
function FixedUpdate () {
	if(myTarget != null) {
		//Target's position, but on the same horizontal plane as the bot.
		var levelPosition = myTarget.transform.position;
		levelPosition.y = transform.position.y;
		this.transform.LookAt(levelPosition);
	}
	
	//Don't get closer than minRange
	if(myPath != null) {
	    if (Vector3.Distance(myPath.vectorPath[currentWayPoint], transform.position) < nextWayPointDistance) {
	        ++ currentWayPoint;
	        //Is the bot at the end of the path?  Stop moving.
	        if (currentWayPoint >= myPath.vectorPath.Length) {
	        	myPath = null;
	            motor.inputMoveDirection = Vector3.zero;
	            return;
	        }
	    }
	    motor.inputMoveDirection = (myPath.vectorPath[currentWayPoint] - transform.position).normalized;
    }
}

//Pick a new target for this bot to kill
//randomly selects a "character" that is not myself
private function chooseTarget() : boolean {
	myGoal = Goal.Attack;
	//pick a target from NPCs and players
    var potentialTargets = GameObject.FindGameObjectsWithTag("character");

    if (potentialTargets != null && potentialTargets.Length > 1) {
    	//pick a random player
    	var index : int = Random.Range(0, potentialTargets.Length);
    	do {
    		index = (index + 1) % potentialTargets.Length;
    		var target = potentialTargets[index];
    	//Not myself
		} while(target.transform.parent.Equals(gameObject.transform));
		myTarget = target;
		return true;
	} else { 
		return false;
	}
}

//Pathfinding has calculated a path to a position.  Start moving towards it.
private function OnPathComplete(p: Pathfinding.Path) {
    if (!p.error) {
        myPath = p;
        currentWayPoint = 0;
    }
    else {
        myPath = null;
    }
}

private function avoidObject(object : GameObject, distance : double) {
	//TODO:  Pick a path to a point that is at least distance away from object
	var awayFromObject = transform.position - object.transform.position;
	var myDestination = object.transform.position + (awayFromObject.normalized * distance);
	seeker.StartPath(this.transform.position, myDestination, OnPathComplete);

	//TODO: don't run into anything while fleeing this object.
}

// Require a character controller to be attached to the same game object
@script RequireComponent (CharacterMotor)
@script AddComponentMenu ("Character/Non Player Controller")
