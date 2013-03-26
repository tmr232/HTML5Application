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
    this.playingTeams = 2;
}

function initGame(img, ctx) {
    var game = new Game();
    
    game.map = new Map(img);
    game.mesh = createMesh(game.map);
    game.area = createGameArea(game.map, game.mesh);
    game.army = createArmy();
    placeAllTeam(game);
}