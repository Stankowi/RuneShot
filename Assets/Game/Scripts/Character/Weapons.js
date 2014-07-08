private var powerCalcStart: int = 0;
private var bouncyGranade: GameObject = null;
private var currentWeapon: WeaponDesc = null;
private var weaponList: Hashtable = new Hashtable();
private var weaponInventory: Array = new Array();
private static var serverCache: Hashtable = new Hashtable();
private var currentWeaponModel: GameObject;

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

function GetCurrentWeaponInventoryIndex()
{
    var currentIndex = -1;
    for (var i = 0; i < weaponInventory.length; ++i){
        if(currentWeapon == weaponInventory[i]) {
            currentIndex = i;
        }
    }
    
    return currentIndex;
}

//Get the key associated with the current weapon. Used to send to server.
function GetCurrentWeaponListKey()
{
    var currentKey: String = "";
    for (var weapon:String in weaponList.Keys){
        if(currentWeapon == weaponList[weapon]) {
            currentKey = weapon;
        }
    }
    
    return currentKey;
}

function ToggleWeapon() {

    var currentIndex = GetCurrentWeaponInventoryIndex();
    
    var nextIndex = (currentIndex + 1) % weaponInventory.length;
    EquipWeapon(weaponInventory[nextIndex]);
}

function AddWeaponToInventory(name:String){
    var alreadPickedUp = false;
    for (var i = 0; i < weaponInventory.length; ++i){
        if(weaponInventory[i] == weaponList[name]) {
            alreadPickedUp = true;
            break;
        }
    }
    if(!alreadPickedUp){
        weaponInventory.Push(weaponList[name]);
    }
}

function ResetInventory(){
    //add weapons to inventory
    weaponInventory.Clear();
    AddWeaponToInventory("laser");
    AddWeaponToInventory("plasma");
    AddWeaponToInventory("bouncyGranade");
    //AddWeaponToInventory("rocket");
    
    EquipWeapon(weaponList["laser"]);
}

function GetCurrentWeaponObj(): Weapon {
    if (currentWeapon != null) {
        return ComponentUtil.GetComponentInHierarchy(currentWeapon.obj,typeof(Weapon)) as Weapon;
    }
    
    return null;
}

function HideWeapon()
{
        var currentModel = Camera.main.transform.Find("WeaponModel");
        if (currentModel != null) {
            Destroy(currentModel.gameObject);
        }
}

function EquipWeapon(weaponDesc: WeaponDesc) {
    currentWeapon = weaponDesc;
    if (gameObject.tag == "Player") {
       currentWeaponModel =  GetCurrentWeaponObj().CreateModel();
    }
}

function Start() {
    laser = Resources.Load("Guns/Laser", GameObject);
    bouncyGranade = Resources.Load("Guns/BouncyGranade", GameObject);
    rocket = Resources.Load("Guns/Rocket", GameObject);
    plasma = Resources.Load("Guns/Plasma", GameObject);
    
    // Setup the weapons list
    weaponList["laser"] = new WeaponDesc(laser, "Laser", WeaponType.WeaponIsProjectile);
    weaponList["bouncyGranade"] = new WeaponDesc(bouncyGranade, "BouncyGranade", WeaponType.WeaponIsProjectile);
    weaponList["rocket"] = new WeaponDesc(rocket, "Rocket", WeaponType.WeaponIsProjectile);
    weaponList["plasma"] = new WeaponDesc(plasma, "Plasma", WeaponType.WeaponIsProjectile);

    //add weapons to inventory
    ResetInventory();    
} 

function Update () {
    if(currentWeaponModel)
    {
        var directionVector = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));

        if(directionVector != Vector3.zero) {
            if(!currentWeaponModel.animation.IsPlaying("WeaponBob")) {
                currentWeaponModel.animation.Play("WeaponBob");
            }
        }
        else {
           if(currentWeaponModel.animation.IsPlaying("WeaponBob")) {
                currentWeaponModel.animation.Stop("WeaponBob");
           }
        }
    }
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
    //Try and get the weapon model
    var cam = transform.root.transform.Find("PlayerCamera(Clone)");
    var weaponPos = transform.position + Vector3(0,1,0);
    if (cam != null)
    {
        var weapon: Weapon = GetCurrentWeaponObj();
        if (weapon != null) {
            weaponPos = GetCurrentWeaponObj().GetProjectileOrigin();
        }
    }
    
    var facing: Vector3 = GetFacingVector(weaponPos);
    
    if (Network.connections.Length > 0) {
        networkView.RPC("EndPowerCalcRemote",
                        RPCMode.Server,
                        Network.player,
                        GetCurrentWeaponListKey(),
                        weaponPos,
                        facing);
         return null;
    }

   if (this.powerCalcStart == 0) {
        return null;
    }

    var end = Time.time;
    Trigger(GetCurrentWeaponListKey(), weaponPos, facing, end - this.powerCalcStart);
    powerCalcStart = 0;
    return null;
}

@RPC
function EndPowerCalcRemote(networkPlayer: NetworkPlayer, weaponKey: String, position: Vector3, facing: Vector3) {
    if (! serverCache.Contains(networkPlayer)) {
        return null;
    }

    var end = Time.time;
    var duration: int = end - serverCache[networkPlayer];
    networkView.RPC("TriggerRemote",
                RPCMode.Others,
                Network.player,
                weaponKey,
                position,
                facing,
                duration);
    serverCache[networkPlayer] = 0;
    return null;
}

@RPC
function TriggerRemote(player: NetworkPlayer, weaponKey: String, position: Vector3, facing: Vector3, pressDuration: int) {

    Trigger(weaponKey, position, facing, pressDuration);
}

function Trigger(weaponKey: String, position: Vector3, facing: Vector3, pressDuration: int) {

    var weapon: WeaponDesc = weaponList[weaponKey];
    if (weapon == null) {
        return null;
    }
    

    switch (weapon.type) {
        case WeaponType.WeaponProducesProjectile:
        TriggerProjectileWeapon(weapon, position, facing, pressDuration);
        break;
    case WeaponType.WeaponIsProjectile:
        TriggerNonProjectileWeapon(weapon, position, facing, pressDuration);
        break;
    }

     return null;
}

function TriggerProjectileWeapon(weaponDesc: WeaponDesc, position: Vector3, facing: Vector3, pressDuration: int) {
    return null;
}

function TriggerNonProjectileWeapon(weaponDesc: WeaponDesc, position: Vector3, facing: Vector3, pressDuration: int) {
    

    
    var rot = Quaternion.FromToRotation(Camera.main.transform.forward, facing);
  
    weapon = Instantiate(weaponDesc.obj, position, rot);
    weaponDesc.Component(weapon).Trigger(gameObject.transform.root.gameObject, facing, pressDuration);
}

//@RPC
//function SecondaryTriggerRemote(player: NetworkPlayer, weaponKey: String, position: Vector3, facing: Vector3, pressDuration: int){
//
//    SecondaryTrigger(weaponKey, position, facing, pressDuration);
//    
//}

function SecondaryTrigger() {

    var weapon: Weapon = GetCurrentWeaponObj();
    if (weapon != null) {
        weaponPos = GetCurrentWeaponObj().GetProjectileOrigin();
    }
    var facing: Vector3 = GetFacingVector(weaponPos);
    var weaponDesc: WeaponDesc = weaponList[GetCurrentWeaponListKey()];
    weaponDesc.Component(weaponDesc.obj).SecondaryTrigger(gameObject.transform.root.gameObject, weaponPos, facing);
}

function GetFacingVector(position: Vector3) {
    if (Camera.main != null)
    {
        var dir : Vector3;
        
        var projRay : Ray = Camera.main.ViewportPointToRay(Vector3(0.5, 0.5, 0));
        var hit : RaycastHit;
        if (Physics.Raycast(projRay, hit)) {
            dir = (hit.point - position).normalized;
        } else {
            dir = projRay.direction;
        }
        
        return projRay.direction;
    }
    
    return Vector3(0,0,0);
}

function CallRemote(): boolean {
    return ComponentUtil.GetComponentInHierarchy(gameObject,"Character").CallRemote();
}

function OnGUI () {

    var keyWidth = 64;
    var keyHeight = 64;
    var margin = 10;
    
    var titleWidth = (keyWidth*3+margin*3);
    var titleHeight = 30;
    var y = titleHeight+128;
    
    GUI.Box(Rect(Screen.width-titleWidth,y,titleWidth,titleHeight),"Weapon Inventory");
    y += titleHeight + margin;
    
    //GUIStyle mystyle = CloneGUIStyle(GUI.skin.box);
    for (var i = 0; i < weaponInventory.length; ++i){
        if(weaponInventory[i] == currentWeapon ){
            GUI.color = Color.red;
        } else {
            GUI.color = Color.white;
        }
        GUI.Box(Rect(Screen.width-(titleWidth*0.75),y,titleWidth/2,titleHeight),weaponInventory[i].name);
        
        y += titleHeight + margin;
    }
}
