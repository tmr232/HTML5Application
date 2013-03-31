/* 
 * The main module, game.c
 */

/*
 * Game class. Holds all global game data.
 */
function Game() {
    this.mesh = null;
    this.map = null;
    this.area = null;
    this.army = null;
    this.playingTeams = 4;
    this.fighterNumber = 20;
    this.globalClock = 1;
}

function initGame(img, ctx) {
    var game = new Game();
    
    game.map = new Map(img);
    game.mesh = createMesh(game.map);
    game.area = createGameArea(game.map, game.mesh);
    game.army = createArmy(game.mesh, game.fighterNumber, game.playingTeams);
    placeAllTeam(game);
    
    return game;
}