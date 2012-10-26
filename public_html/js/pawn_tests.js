//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Classes
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function ExceptionOutOfRange(message)
{
    this.name = "ExceptionOutOfRange";
    this.message = (message || "");
};
ExceptionOutOfRange.prototype = Error.prototype;

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
    }
};

function Pawn() {}

function Cell(content)
{
    this.content = null;
    if (arguments.length === 1)
    {
        this.content = content;
    }

    this.getContent = function()
    {
        return this.content;
    };

    this.setContent = function(content)
    {
        var temp = this.content;
        this.content = content;
        return temp;
    };

    this.isEmpty = function()
    {
        return this.content === null;
    };

    this.empty = function()
    {
        var temp = this.content;
        this.content = null;
        return temp;
    };

    this.toString = function()
    {
        return this.content.toString();
    };
}
Cell.prototype.toString = Cell.toString();

function Map() {
    this.map = null;
    this.width = null;
    this.height = null;

    this.initMap = function(width, height) {
        this.map = createArray2D(width, height, function() {return new Cell();});
        this.width = width;
        this.height = height;
    };
    this.updateMap = function() {};
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
    map.initMap(3,3);
    console.log(map.getCell(2,2));
    console.log(Random.random());
    console.log(Random.randInt(10));
    console.log(Random.randInt(10,20));
}

test_pawn();