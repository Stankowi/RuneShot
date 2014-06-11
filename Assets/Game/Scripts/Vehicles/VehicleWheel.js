#pragma strict

public var renderedWheel : Transform;
public var spinScale : float = 2.0;

private var wheelCollider : WheelCollider;

function Start() {
	this.wheelCollider = this.GetComponent(WheelCollider) as WheelCollider;
}

function Update() {
	this.renderedWheel.Rotate(0, 0, this.wheelCollider.rpm * this.spinScale * Time.deltaTime);
}
