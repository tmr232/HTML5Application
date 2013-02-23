/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function Place() {
    this.mesh = null;
    this.fighter = null;
}


function createGameArea(map, mesh) {
    var currentArea = createArray2D(map.width, map.height, function(){return new Place();});
    
    for (var i = 0; i < mesh.length; ++i) {
        for (var dy = 0; dy < mesh[i].side.size; ++dy) {
            for (var dx = 0; dx < mesh[i].side.size; ++dx) {
                currentArea[mesh[i].x + dx][mesh[i].y + dy].mesh = mesh[i];
            }
        }
    }
    
    return currentArea;
}