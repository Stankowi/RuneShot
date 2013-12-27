private var powerCalcStart: int = 0;
private var bouncyGranade: GameObject = null;
private var currentWeapon: WeaponDesc = null;
private var weaponList: Hashtable = new Hashtable();
private var serverCache: Hashtable = new Hashtable();

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
    if (CallRemote()) {
        networkView.RPC("StartPowerCalc",
                        RPCMode.Server,
                        Network.player);
    } else {
        powerCalcStart = Time.time;
    }
}

@RPC
function StartPowerCalc(networkPlayer: NetworkPlayer) {
    serverCache[NetworkPlayer] = Time.time;
}

function EndPowerCalc() {
    var facing: Vector3 = FacingVector();

    if (CallRemote()) {
        networkView.RPC("EndPowerCalc",
                        RPCMode.Server,
                        Network.player,
                        transform.position,
                        facing);
        return null;
    }

   if (this.powerCalcStart == 0) {
        return null;
    }

    var end = Time.time;
    Trigger(transform.position, facing, end - this.powerCalcStart);
    powerCalcStart = 0;
    return null;
}

@RPC
function EndPowerCalc(networkPlayer: NetworkPlayer, position: Vector3, facing: Vector3) {
    var powerCalcStart: int = serverCache[networkPlayer];
    if (! powerCalcStart) {
        return null;
    }

    var end = Time.time;
    Trigger(position, facing, end - powerCalcStart);
    serverCache[networkPlayer] = 0;
    return null;
}

function Trigger(position: Vector3, facing: Vector3, pressDuration: int) {

    if (currentWeapon == null) {
        return null;
    }

    switch (currentWeapon.type) {
        case WeaponType.WeaponProducesProjectile:
        TriggerProjectileWeapon(currentWeapon, position, facing, pressDuration);
        break;
    case WeaponType.WeaponIsProjectile:
        TriggerNonProjectileWeapon(currentWeapon, position, facing, pressDuration);
        break;
    }

     return null;
}

function TriggerProjectileWeapon(weaponDesc: WeaponDesc, position: Vector3, facing: Vector3, pressDuration: int) {
    return null;
}

function TriggerNonProjectileWeapon(weaponDesc: WeaponDesc, position: Vector3, facing: Vector3, pressDuration: int) {
    var weaponPos = position + Vector3(0,1,0);
    var weapon = Instantiate(weaponDesc.obj, weaponPos, Quaternion.identity);
    weaponDesc.Component(weapon).Trigger(gameObject, facing, pressDuration);
}

function FacingVector() {
    return Camera.main.transform.forward;
}

function CallRemote(): boolean {
    return gameObject.GetComponent("Character").CallRemote();
}
