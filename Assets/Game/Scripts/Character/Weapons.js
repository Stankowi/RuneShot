private var powerCalcStart: int = 0;
private var bouncyGranade: GameObject = null;
private var currentWeapon: WeaponDesc = null;
private var weaponList: Hashtable = new Hashtable();

enum WeaponType {
    WeaponProducesProjectile,
    WeaponIsProjectile
};

class WeaponDesc {
    var obj: GameObject = null;
    var name: String = null;
    var type: WeaponType = WeaponType.WeaponIsProjectile;

    function WeaponDesc(obj: GameObject, name: String, type: WeaponType) {
        this.obj = obj;
        this.name = name;
        this.type = type;
    }

    function Component(target: GameObject) {
        return target.GetComponent(this.name);
    }
}

function Start() {
    bouncyGranade = Resources.Load("Guns/BouncyGranade", GameObject);


    // Setup the weapons list
    weaponList["bouncyGranade"] = new WeaponDesc(bouncyGranade, "BouncyGranade", WeaponType.WeaponIsProjectile);
    currentWeapon = weaponList["bouncyGranade"];

}

function Update () {
    if (Input.GetKeyDown(KeyCode.B)) {
        StartPowerCalc();
    }

    if (Input.GetKeyUp(KeyCode.B)) {
        EndPowerCalc();
    }
}

function StartPowerCalc() {
    powerCalcStart = Time.time;
}

function EndPowerCalc() {
    if (this.powerCalcStart == 0) {
        return null;
    }

    var end = Time.time;

    Trigger(FacingVector(), Power(powerCalcStart, end));

    powerCalcStart = 0;

    return null;
}

function Trigger(facing: Vector3, force: int) {
    if (currentWeapon == null) {
        return null;
    }

    switch (currentWeapon.type) {
        case WeaponType.WeaponProducesProjectile:
        TriggerProjectileWeapon(currentWeapon, facing, force);
        break;
        case WeaponType.WeaponIsProjectile:
        TriggerNonProjectileWeapon(currentWeapon, facing, force);
        break;
    }

     return null;
}

function TriggerProjectileWeapon(weaponDesc: WeaponDesc, facing: Vector3, force: int) {
    return null;
}

function TriggerNonProjectileWeapon(weaponDesc: WeaponDesc, facing: Vector3, force: int) {
    var weaponPos = transform.TransformPoint(0, 1, 1);
    var weapon = Instantiate(weaponDesc.obj, weaponPos, Quaternion.identity);
    weaponDesc.Component(weapon).Trigger(facing, force);
}

function Power(start : int, end : int): int {
    return Mathf.Min((end - start) * 1000, 10000);
}

function FacingVector() {
    return Camera.main.transform.forward;
}
