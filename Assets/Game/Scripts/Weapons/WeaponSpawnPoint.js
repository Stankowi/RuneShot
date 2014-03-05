#pragma strict

public var weapon:String = "bouncyGranade";

function Start () {

}

function Update () {

}

function OnTriggerEnter (player : Collider) {
    
    var weapons = ComponentUtil.GetComponentInHierarchy(player.gameObject,typeof(Weapons)) as Weapons;
    if ( weapons ) {
        //weapons.AddWeaponToInventory("rocket");
        weapons.AddWeaponToInventory(weapon);
    }
}