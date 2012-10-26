//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Custom Exceptions
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function ExceptionOutOfRange(message)
{
    this.name = "ExceptionOutOfRange";
    this.message = (message || "");
};
ExceptionOutOfRange.prototype = Error.prototype;


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Utility Functions
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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

// String Formatting Trick
String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};

Math.sign = function(number) {
  if (number > 0)
  {
      return 1;
  }
  else if (number < 0)
  {
      return -1;
  }
  else
  {
      return 0;
  }
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Classes
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


var Random = {
    'random' : function() {
        return Math.random();
    },
    'randInt' : function(low, high) {
        var range;
        if (arguments.length === 2)
        {
            range = high - low;
        }
        else
        {
            range = low;
            low = 0;
        }
        return Math.floor((this.random() * range) + low);
    },
    'bool' : function() {
        return this.random() < 0.5;
    },
    'oneIn' : function(x) {
        return this.random() * x < 1;
    },
    'select' : function(array) {
        return array[this.randInt(array.length)];
    }
};

function Color(r, g, b) {
    //TODO: add color sanity!
    //TODO: possible add support for floating point colors (0 to 1.0)
    this.r = r;
    this.g = g;
    this.b = b;
    
    this.multiply = function(multiplier) {
        var newColor = new Color(this.r, this.g, this.b);
        newColor.r *= multiplier;
        newColor.g *= multiplier;
        newColor.b *= multiplier;
        return newColor;
    };
    
    this.divide = function(divisor) {
        return this.multiply(1 / divisor);
    };
    
    
    this.toString = function() {
        var r = Math.floor(this.r);
        var g = Math.floor(this.g);
        var b = Math.floor(this.b);
        return "rgb({0},{1},{2})".format(r, g, b);
    };
}
Color.prototype.toString = Color.toString;

function Target(x, y)
{
    this.x = x;
    this.y = y;
}

function Direction(x, y)
{
    this.x = Math.sign(x);
    this.y = Math.sign(y);
}

function Pawn(color, maxLives, target) {
    //TODO: maybe use transparency instead of making color darker
    this.color = color;
    this.maxLives = maxLives;
    this.curLives = maxLives;
    this.target = target;
    
    this.draw = function(ctx, x, y, scale) {
        ctx.save();
        
        ctx.fillStyle = this.color.multiply(this.curLives / this.maxLives).toString();
        ctx.fillRect(x * scale, y * scale, scale, scale);
        console.log(this.color.multiply(this.curLives / this.maxLives).toString());
        ctx.restore();
    };
    
    this.getTargetDirections = function(x, y) {
        //TODO: Important!!! Add more directions!!!
        var dx = target.x - x;
        var dy = target.y - y;
        var directions = new Array();
        
        if ((dx === 0) && (dy === 0)) 
        {
            return directions;
        }
        
        directions[0] = new Direction(dx, dy);
        
        if ((dx === 0) || (dy === 0))
        {
            return directions;
        } 
        else if (dx > dy)
        {
            directions[1] = new Direction(dx, 0);
            directions[2] = new Direction(0, dy);
        }
        else
        {
            directions[1] = new Direction(0, dy);
            directions[2] = new Direction(dx, 0);
        }
        
        return directions;
    };
}

function Map() {
    this.map = null;
    this.width = null;
    this.height = null;
    this.scale = null;

    this.init = function(width, height, scale) {
        this.map = createArray2D(width, height, function() {return null;});
        this.width = width;
        this.height = height;
        this.scale = scale;
    };
    this.update = function() {
        var updatedMap = createArray2D(this.width, this.height, function() {return null;});
        for (var x = 0; x < this.width; ++x)
        {
            for (var y = 0; y < this.height; ++y)
            {
                // Test for a pawn in current location
                if (this.map[x][y] === null)
                {
                    continue;
                }
                // Get the best direction to follow towards the target
                var directions = this.map[x][y].getTargetDirections(x, y);
                var hasMoved = false;
                for (var i = 0; (i < directions.length) && (!hasMoved); ++i)
                {
                    var dir = directions[i];
                    // check if the cell is full
                    try
                    {
                        if (this.map[x+dir.x][y+dir.y] === null)
                        {
                            updatedMap[x+dir.x][y+dir.y] = this.map[x][y];
                            hasMoved = true;
                            break;
                        }
                        // else - attack!!!
                    }
                    catch (ExceptionOutOfRange)
                    {
                        continue;
                    }
                }
                if (!hasMoved)
                {
                    updatedMap[x][y] = this.map[x][y];
                }
            }
        }
        this.map = updatedMap;
    };
    this.draw = function(ctx) {
        ctx.clearRect(0, 0, this.width * this.scale, this.height * this.scale);
        for (var x = 0; x < this.width; ++x)
        {
            for (var y = 0; y < this.height; ++y)
            {
                if (this.map[x][y] === null)
                {
                    continue;
                }
                this.map[x][y].draw(ctx, x, y, this.scale);
            }
        }
    };
    this.getCell = function(x, y) {
        if ((x < 0) || (x >= this.width) || (y < 0) || (y >= this.height))
        {
            throw new ExceptionOutOfRange("Cell location out of map.");
        }
        else
        {
            return this.map[x][y];
        }
    };
}

//          updateMap:
//              for each pawn:
//                  updatePawn:
//                      find target
//                      check if route empty
//                      move / attack / dont move
//

// Testing code:
function test_pawn()
{
    var map = new Map();
    var targets = [new Target(Random.randInt(25, 75), Random.randInt(25, 75)),
        new Target(Random.randInt(25, 75), Random.randInt(25, 75)),
        new Target(Random.randInt(25, 75), Random.randInt(25, 75))];
    var colors = [
        new Color(Random.randInt(255), Random.randInt(255), Random.randInt(255)),
        new Color(Random.randInt(255), Random.randInt(255), Random.randInt(255)),
        new Color(Random.randInt(255), Random.randInt(255), Random.randInt(255))
    ]
    map.init(100,100, 4);
    for (var x = 0; x < 100; ++x)
    {
        for (var y = 0; y < 100; ++y)
        {
            if (Random.oneIn(100))
            {
                var i = Random.randInt(colors.length);
                map.map[x][y] = new Pawn(colors[i], 10, targets[i]);
            }
        }
    }
//    map.map[0][0] = new Pawn(new Color(255,0,0), 10, new Target(50, 50));
//    map.map[0][0].curLives = 5;
//    map.map[1][1] = new Pawn(new Color(0,255,0), 10, new Target(50, 50));
    
    var canvas = document.querySelector("#canvas");
    var ctx = canvas.getContext("2d");
    
    window.setInterval(function() {map.draw(ctx);map.update(ctx);}, 100);
    
//    map.draw(ctx);
//    console.log(map.map);
//    map.update();
//    console.log(map.map);
//    alert();
//    map.draw(ctx);
//    map.update();
//    console.log(map.map);
//    alert();
//    map.draw(ctx);
//    console.log(map.getCell(2,2));
//    console.log(Random.random());
//    console.log(Random.randInt(10));
//    console.log(Random.randInt(10,20));
}

$(document).ready(test_pawn);