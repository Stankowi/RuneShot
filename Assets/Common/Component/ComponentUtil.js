#pragma strict

static function GetComponentInHierarchy(gameObject : GameObject, componentType : System.Type) {
    var rootGo = gameObject.transform.root.gameObject;
    var component = rootGo.GetComponent(componentType);
    if(component == null) {
        component = rootGo.GetComponentInChildren(componentType);
    }
    return component;
}

static function GetComponentInHierarchy(gameObject : GameObject, componentType : String) {
    return GetComponentInHierarchy(gameObject,System.Type.GetType(componentType));
}