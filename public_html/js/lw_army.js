/*
 * port for the army module (army.h & army.c)
 */

function Army() {
    this.size = 0;
    this.fighters = null;
}

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
    var army = new Army();
    var armySize = (getBattleRoom(mesh) * fillTable[fighterNumber]) / 100;
    armySize /= playingTeams;
    armySize = Math.max(armySize, 1);
    armySize *= playingTeams;
    
    army.size = armySize;
    
    var armyFighters = new Array(armySize);
    for (var i = 0; i < armySize; ++i) {
        armyFighters[i] = new Fighter();
    }

    army.fighters = armyFighters;

    return army;
}

function placeAllTeam(game) {
    /* For now, ignoring the networking option... */
    for (var i = 0; (i < NB_TEAMS) && (n < NB_TEAMS); ++i) {
        /*TODO: make sure only playing teams are created!
         * Do this using Game class variables and not globals... */
        placeTeam(i, n, game);
        autoCursor(i, n, CONFIG_PLAYER_NAME[i]);
        ++n;
    }
}

function placeTeam(part, team, game) {
    var fighters = 
}