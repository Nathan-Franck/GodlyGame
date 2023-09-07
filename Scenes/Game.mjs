/**
 * @template {string} T
 * @param {T} scenePath
 */
function instantiateScene(scenePath) {
    return /**@type godot.Node3D<import("res://Levels/Level1.blend").Level1Spec>*/(
        /**@type godot.PackedScene*/(godot.ResourceLoader.load("res://Levels/Level1.blend")).instantiate()
    );
}


export default class Game extends godot.Node {

    constructor() {
        super();
    }

    // Called when the node enters the scene tree for the first time.
    _ready() {
        this.levelInstance = /**@type godot.Node3D<import("res://Levels/Level1.blend").Level1Spec>*/(
            /**@type godot.PackedScene*/(godot.ResourceLoader.load("res://Levels/Level1.blend")).instantiate()
        );
        this.add_child(this.levelInstance);
        this.levelInstance.set_rotation(new godot.Vector3(0, Math.PI / 2, 0));
        this.levelFrame = /**@type godot.Node<import('LevelFrame.tscn').LevelSpec>*/(
            /**@type godot.PackedScene*/(godot.ResourceLoader.load("res://Scenes/LevelFrame.tscn")).instantiate()
        );
        this.add_child(this.levelFrame);
    }

    // Called every frame. 'delta' is the elapsed time since the previous frame.
    _process(delta) {
        var rockBackGeo = this.levelInstance.get_node("./RockBack");
        console.log("Hello from Game!");
        console.log(`RockBack position: ${rockBackGeo.get_global_transform().origin}`);
        // Frame the level frame Camera3D to the rock back geo bounds
        var rockBackBounds = rockBackGeo.get_mesh().get_aabb();

        var levelFrameCamera = this.levelFrame.get_node("./Camera3D");

        levelFrameCamera.set_position(rockBackBounds.position - new godot.Vector3(0, 0, rockBackBounds.size.z * 2));
    }
}
