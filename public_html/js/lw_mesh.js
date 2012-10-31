/*
 * Implementation of the mesh generation for LW
 */
/*
 * Utilities
 */

function createArray2D(x, y, initCallback)
{
    var array = new Array(x);
    for (var i = 0; i < x; ++i)
    {
        array[i] = new Array(y);
        for (var j = 0; j < y; ++j)
        {
            array[i][j] = initCallback(i, j, x, y);
        }
    }

    return array;
}

/*
 * Specifics
 */

var DIR_NNE = 0;
var DIR_NE = 1;
var DIR_ENE = 2;
var DIR_ESE = 3;
var DIR_SE = 4;
var DIR_SSE = 5;
var DIR_SSW = 6;
var DIR_SW = 7;
var DIR_WSW = 8;
var DIR_WNW = 9;
var DIR_NW = 10;
var DIR_NNW = 11;

var NB_DIRS = 12;

function Mesher() {
    this.used = 1;
    this.size = 3;
    this.link = new Array(NB_DIRS);
    for (var i=0; i < NB_DIRS; ++i) {
        this.link = null;
    }
    this.corres;
}

function createFirstMesher(map) {
    var height = map.height;
    var width = map.width;
    var result = createArray2D(width, height, function(){new Mesher();});
    
    // For each mesher, check if it is empty, or a wall.
    for (var x = 0; x < width; ++x) {
        for (var y = 0; y < height; ++y) {
            // If empty - than it can be used!
            result[x][y].used = map.isEmpty(x, y);
        }
    }
    
    
    // Link all meshers.
    for (var y = 1; y < height - 1; ++y) {
        for (var x = 1; x < width - 1; ++x) {
            
            if (result[x][y].used) {
                if (result[x][y-1].used) {
                    result[x][y].link[DIR_NNW] = result[x][y].link[DIR_NNE] =
                            result[x][y-1];
                }
                if (result[x+1][y-1].used) {
                    result[x][y].link[DIR_NE] = result[x+1][y-1];
                }
                if (result[x+1][y].used) {
                    result[x][y].link[DIR_ENE] = result[x][y].link[DIR_ESE] =
                            result[x+1][y];
                }
                if (result[x+1][y+1].used) {
                    result[x][y].link[DIR_SE] = result[x+1][y+1];
                }
                if (result[x][y+1].used) {
                    result[x][y].link[DIR_SSE] = result[x][y].link[DIR_SSW] =
                            result[x][y+1];
                }
                if (result[x-1][y+1].used) {
                    result[x][y].link[DIR_SW] = result[x-1][y+1];
                }
                if (result[x-1][y].used) {
                    result[x][y].link[DIR_WSW] = result[x][y].link[DIR_WNW] =
                            result[x-1][y];
                }
                if (result[x-1][y-1].used) {
                    result[x][y].link[DIR_NW] = result[x-1][y-1];
                }
            }
        }
    }
    
    return result;
}