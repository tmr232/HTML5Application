/*
 * port for the army module (army.h & army.c)
 */


MAX_FIGHTER_HEALTH = 16384;


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
    //TODO: make sure this is the case in the original code...
    armySize = Math.floor(armySize);
    
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
//    for (var i = 0, n = 0; (i < NB_TEAMS) && (n < NB_TEAMS); ++i) {
    for (var i = 0, n = 0; (i < game.playingTeams) && (n < game.playingTeams); ++i) {
        /*TODO: make sure only playing teams are created!
         * Do this using Game class variables and not globals... */
        placeTeam(i, n, game);
        //TODO: uncomment...
        //autoCursor(i, n, CONFIG_PLAYER_NAME[i]);
        ++n;
    }
}

function placeTeam(part, team, game) {
    var x, y;
    var xMin, xMax;
    var yMin, yMax;
    var w = game.map.width;
    var h = game.map.height;
    
    var health = MAX_FIGHTER_HEALTH - 1;
    
    switch(part) {
        case 0:
            x = w / 6;
            y = h / 4;
            break;
        case 1:
            x = w / 2;
            y = h / 4;
            break;
        case 2:
            x = (5 * w) / 6;
            y = h / 4;
            break;
        case 3:
            x = w / 6;
            y = (3 * h) / 4;
            break;
        case 4:
            x = w / 2;
            y = (3 * h) / 4;
            break;
        default:
            x = (5 * w) / 6;
            y = (3 * h) / 4;
            break;
    }
    x = Math.floor(x);
    y = Math.floor(y);

    xMin = xMax = x;
    yMin = yMax = y;
    
    var placed = 0;
    var fighters = Math.floor(game.army.size / game.playingTeams);
    while (placed < fighters) {
        for (x = xMin; (x <= xMax) && (placed < fighters); ++x) {
            placed += addFighter(
                game,
                game.army.fighters[team + placed * game.playingTeams],
                team,
                x,
                yMin,
                health);
        }
        if (xMax < (w - 2)) {
            ++xMax;
        }
    
        for (y = yMin; (y <= yMax) && (placed < fighters); ++y) {
            placed += addFighter(
                game,
                game.army.fighters[team + placed * game.playingTeams],
                team,
                xMax,
                y,
                health);
        }
        if (yMax < (h - 2)) {
            ++yMax;
        }
    
        for (x = xMax; (x >= xMin) && (placed < fighters); --x) {
            placed += addFighter(
                game,
                game.army.fighters[team + placed * game.playingTeams],
                team,
                x,
                yMax,
                health);
        }
        if (xMin > 1) {
            --xMin;
        }
    
        for (y = yMax; (y >= yMin) && (placed < fighters); --y) {
            placed += addFighter(
                game,
                game.army.fighters[team + placed * game.playingTeams],
                team,
                xMin,
                y,
                health);
        }
        if (yMin > 1) {
            --yMin;
        }
    }
}

function addFighter(game, fighter, team, x, y, health) {
    var j = y * game.map.width + x;
    
    if ((game.area[x][y].mesh !== null) && (game.area[x][y].fighter === null)) {
        game.area[x][y].fighter = fighter;
        
        fighter.health = health;
        fighter.team = team;
        fighter.x = x;
        fighter.y = y;
        fighter.lastDir = j % NB_DIRS;
        
        return 1;
    }

    return 0;
}