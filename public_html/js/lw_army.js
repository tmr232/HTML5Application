/*
 * port for the army module (army.h & army.c)
 */

function getBattleRoom(mesh) {
    var room = 0;
    for (var i = 0; i < mesh.length; ++i) {
        room += Math.pow(mesh[i].side.size, 2);
    }

    return room;
}

function createArmy(mesh) {
    
}