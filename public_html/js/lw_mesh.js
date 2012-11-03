/*
 * Implementation of the mesh generation for LW
 */
/*
 * Utilities
 */


/*
 * Create imageData object from image
 */
function getImageData(img) {
    // Create an in-memory canvas
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    // In-memory draw the image
    context.drawImage(img, 0, 0 );
    // Get ImageData
    var myData = context.getImageData(0, 0, img.width, img.height);
    
    return myData;
}

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

function createArray(dimensions, initCallback) {
    return internalCreateArray(dimensions, initCallback, [], dimensions);
}

function internalCreateArray(dimensions, initCallback, indices, originalDimensions) {
    if (dimensions.length === 1) {
        var array = new Array(dimensions[0]);
        if (initCallback !== null) {
            for (var i = 0; i < array.length; ++i) {
                array[i] = initCallback(Array().concat(indices, i), originalDimensions);
            }
        }
        return array;
    } else if (dimensions.length > 1) {
        var array = new Array(dimensions[0]);
        for (var i = 0; i < array.length; ++i) {
            array[i] = internalCreateArray( dimensions.slice(1),
                                            initCallback,
                                            indices.concat(i),
                                            originalDimensions);
        }
        return array;
    }
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
var MESH_MAX_ELEM_SIZE = 16;

var MAP_FG_R = 255;
var MAP_FG_G = 255;
var MAP_FG_B = 255;
var MAP_FG_A = 255;

function Map(img) {
    this.img = img;
    this.imageData = getImageData(img);
    this.width = img.width;
    this.height = img.height;
    this.isEmpty = function(x, y) {
        return !(this.imageData.data[(x + y * this.width) * 4 + 0] === MAP_FG_R &&
                this.imageData.data[(x + y * this.width) * 4 + 1] === MAP_FG_G &&
                this.imageData.data[(x + y * this.width) * 4 + 2] === MAP_FG_B &&
                this.imageData.data[(x + y * this.width) * 4 + 3] === MAP_FG_A);
    };
    this.draw = function(ctx, x, y, scale) {
        ctx.drawImage(this.img, x, y, this.width * scale, this.height * scale);
    };
}

function Mesher() {
    this.used = 1;
    this.size = 1;
    this.link = new Array(NB_DIRS);
    for (var i=0; i < NB_DIRS; ++i) {
        this.link[i] = null;
    }
    
    // Used only in mesh creation (to tell mesh index)
    this.corres;
}

function Side() {
    this.decal_for_dir;
    this.size;
}

function State() {
    this.dir;
    this.grad = AREA_START_GRADIENT;
}

function Update() {
    this.time;
    this.x;
    this.y;
    this.cursor;
}

function Info() {
    this.update = new Update();
    this.state = new State();
}

function Mesh() {
    this.x;
    this.y;
    this.side = new Side();
    this.info = new Array(NB_TEAMS);
    for (var i = 0; i < NB_TEAMS; ++i) {
        this.info[i] = new Info();
    }
    this.link = new Array(NB_DIRS);
    for (var i=0; i < NB_DIRS; ++i) {
        this.link[i] = null;
    }
}

/*
 * Creates meshers over the entire map
 */
function createFirstMesher(map) {
    var height = map.height;
    var width = map.width;
    var result = createArray2D(width, height, function(){return new Mesher();});
    
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
                ne.link[DIR_NE] !== null &&
                se.link[DIR_SE] !== null &&
                sw.link[DIR_SW] !== null && nw.link[DIR_NW] !== null) {
            
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
                            if (test === ne || test === se || test === sw) {
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
//    var mesher_size = map.width * map.height;
    var size = 0;
    for (currentMesher in mesher) {
        if (currentMesher.used) {
            ++size;
        }
    }
    
    var j = 0;
    var result = new Array(size);
    for (var x = 0; x < map.width; ++x) {
        for (var y = 0; y < map.height; ++y) {
            
            if (mesher[x][y].used) {
                result[j] = new Mesh();
                result[j].x = x;
                result[j].y = y;
                result[j].side.decal_for_dir = 0;
                result[j].side.size = mesher[x][y].size;
                // Copy links from mesher
                for (var k = 0; k < NB_DIRS; ++k) {
                    result[j].link[k] = mesher[x][y].link[k];
                }
                mesher[x][y].corres = j;

                // One mesh created, goto next.
                ++j;
            }
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

/*
 * creates a mesh matching the given map.
 * @param {Map} map The map to use.
 */
function createMesh(map)
{
    var mesher = createFirstMesher(map);
    for (var i = 1; i <= MESH_MAX_ELEM_SIZE / 2; i *= 2) {
        if (!groupMesher(mesher, map, i)) {
            console.log(i);
            break;
        }
    }
    var meshArray = mesherToMesh(mesher, map);
    
    return meshArray;
}

function resetMesh(mesh) {
    for (var i = 0; i < mesh.length; ++i) {
        for (var j = 0; j < NB_TEAMS; ++j) {
            mesh[i].info[j].state.dir = (i + j) % NB_DIRS;
            mesh[i].info[j].update.time = -1;
        }
    }
}

/*
 * Debugging functions
 */

function drawMesh(meshArray, ctx, x, y, scale) {
    ctx.save();
    ctx.fillStyle = "#dd0000";
    ctx.strokeStyle = "#dd0000";
    for (var i = 0; i < meshArray.length; ++i) {
        var mesh = meshArray[i];
        ctx.strokeRect( (x + mesh.x) * scale, (y + mesh.y) * scale,
                        mesh.side.size * scale, mesh.side.size * scale);
    }
    ctx.restore();
}

function lw_mesh_test(img, ctx) {
    var map = new Map(img);
    var meshArray = createMesh(map);
    var scale = 5;
    var x = 0;
    var y = 0;
    map.draw(ctx, x, y, scale);
    drawMesh(meshArray, ctx, x, y, scale);
}