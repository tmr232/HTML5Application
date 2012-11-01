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
var NB_TEAMS = 6;

function Mesher() {
    this.used = 1;
    this.size = 3;
    this.link = new Array(NB_DIRS);
    for (var i=0; i < NB_DIRS; ++i) {
        this.link = null;
    }
    this.corres;
}

function Side() {
    this.decal_for_dir;
    this.size;
}

function Mesh() {
    this.x;
    this.y;
    this.side = new Side();
    this.info = new Array(NB_TEAMS);
    this.link = new Array(NB_DIRS);
    for (var i=0; i < NB_DIRS; ++i) {
        this.link = null;
    }
}

/*
 * Creates meshers over the entire map
 */
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

/*
 * Groups meshers into bigger ones
 */
function groupMesher(mesher, map, step) {
    var found = 0;
    var ne, se, sw, nw, test;
    var height = map.height;
    var width = map.width;
    
    for (var y = 0; y < height - step; y += step * 2) {
        for (var x = 0; x < width - step; x += step * 2) {
            ne = mesher[x+step][y];
            se = mesher[x+step][y+step];
            sw = mesher[x][y+step];
            nw = mesher[x][y];
            
            //mesh.c:192
            if (ne.used && ne.size === step &&
                se.used && se.size === step &&
                sw.used && sw.size === step &&
                nw.used && nw.size === step &&
                ne.link[DIR_NNW] === ne.link[DIR_NNE] &&
                ne.link[DIR_ENE] === ne.link[DIR_ESE] &&
                se.link[DIR_ENE] === se.link[DIR_ESE] &&
                se.link[DIR_SSE] === se.link[DIR_SSW] &&
                sw.link[DIR_SSE] === sw.link[DIR_SSW] &&
                sw.link[DIR_WSW] === sw.link[DIR_WNW] &&
                nw.link[DIR_WSW] === nw.link[DIR_WNW] &&
                nw.link[DIR_NNW] === nw.link[DIR_NNE] &&
                ne.link[DIR_NE] != NULL &&
                se.link[DIR_SE] != NULL &&
                sw.link[DIR_SW] != NULL && nw.link[DIR_NW] != NULL) {
            
                ne.used = 0;
                se.used = 0;
                sw.used = 0;

                nw.size = step * 2;
                nw.link[DIR_NNE] = ne.link[DIR_NNE];
                nw.link[DIR_NE] = ne.link[DIR_NE];
                nw.link[DIR_ENE] = ne.link[DIR_ENE];
                nw.link[DIR_ESE] = se.link[DIR_ESE];
                nw.link[DIR_SE] = se.link[DIR_SE];
                nw.link[DIR_SSE] = se.link[DIR_SSE];
                nw.link[DIR_SSW] = sw.link[DIR_SSW];
                nw.link[DIR_SW] = sw.link[DIR_SW];
                nw.link[DIR_WSW] = sw.link[DIR_WSW];

                for (var j=0; j<NB_DIRS; ++j) {
                    for (var k=0; k<NB_DIRS; ++k) {
                        if (nw.link[j]) {
                            test = nw.link[j].link[k];
                            if (test == ne || test == se || test == sw) {
                                nw.link[j].link[k] = nw;
                            }
                        }
                    }
                }
                
                // We've merged meshers!!!
                ++found;
            }
        }
    }
        
    return found;
}

function mesherToMesh(mesher, map) {
    var mesher_size = map.width * map.height;
    var size = 0;
    for (currentMesher in mesher) {
        if (currentMesher.used) {
            ++size;
        }
    }
    
    var j = 0;
    var result = new Array(size);
    for (var i = 0; i < mesher_size; ++i) {
        if (mesher[i].used) {
            result[j] = new Mesh();
            result[j].x = i % map.width;
            result[j].y = i / map.width;
            result[j].side.decal_for_dir = 0;
            result[j].size.size = mesher[i].size;
            // Copy links from mesher
            for (var k = 0; k < NB_DIRS; ++l) {
                result[j].link[k] = mesher[i].link[k];
            }
            mesher[i].corres = j;
            
            // One mesh created, goto next.
            ++j;
        }
    }
    
    // Now fix links to go to meshes and not meshers
    for (j = 0; j < size; ++j) {
        for (var k = 0; k < NB_DIRS; ++k) {
            var temp = result[j].link[k];
            if (temp !== null) {
                result[j].link[k] = result[temp.corres];
            }
        }
    }
    
    return result;
}