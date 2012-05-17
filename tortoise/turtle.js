if (typeof module !== 'undefined') {
    var Raphael = require('node-raphael');
} else {
    var Raphael = R;
}

var Turtle = function (x, y, w, h) {
    this.paper = Raphael(x, y, w, h);
    this.originx = w / 2;
    this.originy = h / 2;
    this.clear();
};

Turtle.prototype.clear = function () {
    this.paper.clear();
    this.x = this.originx;
    this.y = this.originy;
    this.angle = 90;
    this.pen = true;
    this.turtleimg = undefined;
    this.updateTurtle();
};

Turtle.prototype.updateTurtle = function () {
    if (this.turtleimg === undefined) {
        this.turtleimg = this.paper.image(
            "http://nathansuniversity.com/gfx/turtle2.png",
            0, 0, 64, 64);
    }
    this.turtleimg.attr({
        x: this.x - 32,
        y: this.y - 32,
        transform: "r" + (-this.angle)});
    this.turtleimg.toFront();
};

Turtle.prototype.drawTo = function (x, y) {
    var x1 = this.x;
    var y1 = this.y;
    var params = { "stroke-width": 4 };
    var path = this.paper.path(Raphael.format("M{0}, {1}L{2},{3}",
        x1, y1, x, y)).attr(params);
};

Turtle.prototype.forward = function (d) {
    var newx = this.x + Math.cos(Raphael.rad(this.angle)) * d;
    var newy = this.y - Math.sin(Raphael.rad(this.angle)) * d;
    if (this.pen) {
        this.drawTo(newx, newy);
    }
    this.x = newx;
    this.y = newy;
    this.updateTurtle();
};

Turtle.prototype.right = function (ang) {
    this.angle -= ang;
    this.updateTurtle();
};
Turtle.prototype.left = function(ang) {
    this.angle += ang;
    this.updateTurtle();
};

// If we are used as Node module, export evalTortoise(String)
if (typeof module !== 'undefined') {
    module.exports.Turtle = Turtle;
}
