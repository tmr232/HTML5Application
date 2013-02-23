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

function createArmy(mesh, fighterNumber, playingTeams) {
    var fillTable = [ 1, 2, 3, 4, 5, 6, 8, 9,
                    10, 12, 14, 16, 18, 20, 22, 24,
                    25, 27, 29, 31, 33, 36, 40, 45,
                    50, 55, 60, 65, 70, 75, 80, 90,
                    99    ];
                
    // Army size calculation - same as in army.c
    var armySize = (getBattleRoom(mesh) * fillTable[fighterNumber]) / 100;
    armySize /= playingTeams;
    armySize = Math.max(armySize, 1);
    armySize *= playingTeams;
    
    var army = new Array(armySize);
    for (var i = 0; i < armySize; ++i) {
        army[i] = new Fighter();
    }

    return army;
}