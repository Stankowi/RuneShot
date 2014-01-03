enum AttackState {
    AttackWaiting,
    AttackCharging
};

enum MoveState {
    Init,
    PathFinding,
    Moving,
    Stand,
}

var minAttackDelay: float = 2.0f;
var maxAttackDelay: float = 8.0f;
var minStandTime: float = 4.0f;
var maxStandTime: float = 10.0f;

private var motor : CharacterMotor;
private var attackTimer : float;
private var chargeTimer : float;
private var attackState : AttackState = AttackState.AttackWaiting;
private var seeker: Seeker = null;
private var curPath: Pathfinding.Path = null;
private var currentWayPoint: int = 0;
private var moveState: MoveState = MoveState.Init;
private var nextWayPointDistance: float = 3.0f;
private var standTime: float = 0.0f;

// Use this for initialization
function Awake () {
    motor = GetComponent(CharacterMotor);
    attackTimer = Random.Range(minAttackDelay, maxAttackDelay);
    seeker = GetComponent(Seeker);
    moveState = MoveState.Init;
}

// Update is called once per frame
function Update () {
    var wpns = ComponentUtil.GetComponentInHierarchy(gameObject,Weapons);
    if (wpns != null) {
        switch (attackState) {
            case AttackState.AttackCharging: 
                chargeTimer -= Time.deltaTime;
                if (chargeTimer <= 0.0f) {
                    wpns.EndPowerCalc();
                    attackState = AttackState.AttackWaiting;
                    attackTimer = Random.Range(minAttackDelay, maxAttackDelay);
                }
                break;
            
            case AttackState.AttackWaiting:
                attackTimer -= Time.deltaTime;
                if (attackTimer <= 0.0f) {
                    wpns.StartPowerCalc();
                    attackState = AttackState.AttackCharging;
                    chargeTimer = Random.Range(minAttackDelay, maxAttackDelay);
                }
            
        }
    }    
    switch (moveState) {
        case MoveState.Init:
            // Pick a random target
            var moveTargets = GameObject.FindGameObjectsWithTag("CoverPoint");
            if (moveTargets != null && moveTargets.Length) {            
                seeker.StartPath(this.transform.position, moveTargets[Random.
                    Range(0, moveTargets.Length)].transform.position, OnPathComplete);
                moveState = MoveState.PathFinding;
                currentWayPoint = 0;
            }
            break;
        case MoveState.Moving:
            if (Vector3.Distance(curPath.vectorPath[currentWayPoint], transform.position) < nextWayPointDistance) {
                ++ currentWayPoint;
                if (currentWayPoint >= curPath.vectorPath.Length) {
                    moveState = MoveState.Stand;
                    motor.inputMoveDirection = Vector3.zero;
                    standTime = Random.Range(minStandTime, maxStandTime);
                    break;
                }
            }
            motor.inputMoveDirection = (curPath.vectorPath[currentWayPoint] - transform.position).normalized;
            break;
        case MoveState.Stand:
            standTime -= Time.deltaTime;
            if (standTime <= 0.0f) { 
                moveState = MoveState.Init;
            }
            break;
    }
}

function OnPathComplete(p: Pathfinding.Path) {
    if (!p.error) {
        moveState = MoveState.Moving;
        curPath = p;
    }
    else {
        moveState = MoveState.Init;
        curPath = null;
    }
}

// Require a character controller to be attached to the same game object
@script RequireComponent (CharacterMotor)
@script AddComponentMenu ("Character/Non Player Controller")
