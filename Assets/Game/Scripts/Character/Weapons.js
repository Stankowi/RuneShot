private var powerCalcStart: int = 0;
private var bouncyGranade: GameObject = null;
private var currentWeapon: WeaponDesc = null;
private var weaponList: Hashtable = new Hashtable();
private static var serverCache: Hashtable = new Hashtable();

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
        return ComponentUtil.GetComponentInHierarchy(target,this.name);
    }
}

function Start() {
    bouncyGranade = Resources.Load("Guns/BouncyGranade", GameObject);
    rocket = Resources.Load("Guns/Rocket", GameObject);

    // Setup the weapons list
    weaponList["bouncyGranade"] = new WeaponDesc(bouncyGranade, "BouncyGranade", WeaponType.WeaponIsProjectile);
    weaponList["rocket"] = new WeaponDesc(rocket, "Rocket", WeaponType.WeaponIsProjectile);
    
    currentWeapon = weaponList["bouncyGranade"];
} 

function Update () {
}

function StartPowerCalc() {
    if (CallRemote()) {
        networkView.RPC("StartPowerCalcRemote",
                        RPCMode.Server,
                        Network.player);
    } else {
        powerCalcStart = Time.time;
    }
}

@RPC
function StartPowerCalcRemote(networkPlayer: NetworkPlayer) {
    serverCache[networkPlayer] = Time.time;
}

function EndPowerCalc() {
    var facing: Vector3 = FacingVector();

    if (CallRemote()) {
        networkView.RPC("EndPowerCalcRemote",
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
function EndPowerCalcRemote(networkPlayer: NetworkPlayer, position: Vector3, facing: Vector3) {
    if (! serverCache.Contains(networkPlayer)) {
        return null;
    }

    var end = Time.time;
    Trigger(position, facing, end - serverCache[networkPlayer]);
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

    if (CallRemote()) {
        weapon = Network.Instantiate(weaponDesc.obj, weaponPos, Quaternion.identity, 12);
    } else {
        weapon = Instantiate(weaponDesc.obj, weaponPos, Quaternion.identity);
    }

    weaponDesc.Component(weapon).Trigger(gameObject.transform.root.gameObject, facing, pressDuration);
}

function FacingVector() {
    return Camera.main.transform.forward;
}

function CallRemote(): boolean {
    return ComponentUtil.GetComponentInHierarchy(gameObject,"Character").CallRemote();
}
