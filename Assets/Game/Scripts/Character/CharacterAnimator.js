#pragma strict
@script RequireComponent(Animator)

var animatorMotionHorizontal = "HorizontalSpeed";
var animatorMotionForward = "ForwardSpeed";

var animator : Animator;
var lastPosition : Vector3;

// Movement history is used to average out the movement over a period of time.
// This is especially useful for network characters, who currently do not update position every frame.
private var movementHistoryCount : int = 15;
private var movementHistory : Vector3[] = new Vector3[movementHistoryCount];

function Start () {
    animator = gameObject.GetComponent(Animator);
    lastPosition = transform.position;
}

function FixedUpdate () {    
    var movement : Vector3 = GetLatestMovement();
    var averageMovement = UpdateMovementHistory(movement);
    ApplyMovementToAnimation(averageMovement);
    lastPosition = transform.position;
}

function GetLatestMovement() {
    var movement : Vector3 = transform.position - lastPosition;

    return Vector3Util.RotateY(movement,-transform.rotation.eulerAngles.y * Mathf.Deg2Rad) * 4;
}

function UpdateMovementHistory(movement : Vector3) {
    var averageMovement : Vector3 = movement;
    for(var index : int = 0; index < movementHistoryCount; index++) {
        if(index < movementHistoryCount-1) {
            movementHistory[index] = movementHistory[index+1];
        }
        averageMovement += movementHistory[index];
    }
    movementHistory[movementHistoryCount-1] = movement;
    averageMovement.x = averageMovement.x / (movementHistoryCount+1);
    averageMovement.z = averageMovement.z / (movementHistoryCount+1);
    
    return averageMovement;
}
    
function ApplyMovementToAnimation(averageMovement : Vector3) {
    animator.SetFloat(animatorMotionForward, averageMovement.z);
    animator.SetFloat(animatorMotionHorizontal, -averageMovement.x);
}


