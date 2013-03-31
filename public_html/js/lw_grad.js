function spreadSingleGradient(game) {
    var dir = (game.globalClock * 7) % NB_DIRS;
    var pos = null;
    var temp = null;
    var new_grad = null;
    
    switch (dir) 
    {
        case DIR_ENE:
        case DIR_ESE:
        case DIR_SE:
        case DIR_SSE:
        case DIR_SSW:
        case DIR_SW:
            for (var index = 0; index < game.mesh.length; ++index) {
                pos = game.mesh[index];
                for (var i = 0; i < game.playingTeams; ++i) {
                    temp = pos.link[dir];
                    new_grad = pos.info[i].state.grad + pos.side.size;
                    if (null !== temp) {
                        if (temp.info[i].state.grad > new_grad) {
                            temp.info[i].state.grad = new_grad;
                        }
                    }
                }
            }
        break;

        case DIR_WSW:
        case DIR_WNW:
        case DIR_NW:
        case DIR_NNW:
        case DIR_NNE:
        case DIR_NE:
            for (var index = game.mesh.length - 1; index >= 0; --index) {
                pos = game.mesh[index];
                for (var i = 0; i < game.playingTeams; ++i) {
                    temp = pos.link[dir];
                    new_grad = pos.info[i].state.grad + pos.side.size;
                    if (null !== temp) {
                        if (temp.info[i].state.grad > new_grad) {
                            temp.info[i].state.grad = new_grad;
                        }
                    }
                }
            }
        break;
              
    }
}