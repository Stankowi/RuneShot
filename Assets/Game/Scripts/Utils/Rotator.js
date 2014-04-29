#pragma strict


public var rotationAxis : Vector3;
public var rotationSpeed : float;

function Start () {

}

function Update () {
    this.transform.RotateAround(rotationAxis, rotationSpeed * Time.deltaTime);
}