/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


function Fighter() {
  this.x = 0;
  this.y = 0;
  this.health = 0;
  this.team = -1;
  this.lastDir = 0;
}

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

function resetGameArea(mesh, area) {
    for (var i = 0; i < mesh.length; ++i) {
        for (var k = 0; k < NB_TEAMS; ++k) {
            mesh[i].info[k].state.grad = AREA_START_GRADIENT;
        }
    }

    var areaArea = area.length * area[0].length;
    for (var i = 0; i < areaArea; ++i) {
        area[i].fighter = null;
    }
}