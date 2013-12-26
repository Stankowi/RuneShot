var healthColor: Color;

private var barDisplay : float = 0;

private var emptyStyle: GUIStyle;
private var healthStyle: GUIStyle;

private var pcHealth: Health = null;

function Start () {
    
    //
    // Setup the empty GUIStyle
    //
    var emptyTexture = new Texture2D(1,1);
    emptyTexture.SetPixel(0,0,Color(.1,.1,.1,.5));
    emptyTexture.Apply();
    
    emptyStyle = new GUIStyle();
    emptyStyle.normal.background = emptyTexture;
   
    //
    // Setup the Health GUIStyle
    //
    var healthTexture = new Texture2D(1,1);
    healthTexture.SetPixel(0,0,Color(1,.3,0,.5));
    healthTexture.Apply();
    
    healthStyle = new GUIStyle();
    healthStyle.normal.background = healthTexture;
}
 
function OnGUI()
{   
    // Player's Health Bar
    if( pcHealth != null )
    {
        var fullWidth = Screen.width - 40;
        var currWidth = (Screen.width - 40) * pcHealth.GetHealth() / pcHealth.GetMaxHealth();
        
        var healthTotalBox   = Rect (20, Screen.height - 40, fullWidth, 15);
        var healthCurrentBox = Rect (20, Screen.height - 40, currWidth, 15);
        
        // draw the health background box   
        GUI.Box (healthTotalBox, pcHealth.GetHealth() + " / " + pcHealth.GetMaxHealth(), emptyStyle);
     
        // draw the current health box
        GUI.Box (healthCurrentBox, GUIContent.none, healthStyle);
    }
}

function SetPlayerHealth( health: Health )
{
    pcHealth = health;
}
