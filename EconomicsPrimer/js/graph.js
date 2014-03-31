
var Line = Backbone.Model.extend({
    defaults: function() {
        return {
            "points": [],
            "lineColor": '#000000',
            "lineThickness": 2,
            "lineStyle": null, /* input any stroke-dasharray pattern */
            "showLine": true,
            "xIntercepts": [],
            "yIntercepts": [],
            "axisLabel": "",
            "labelAxis": 1, /* 0 is x, 1 is y */
            "showAxisLabel": true,
            "active": true,
            "fillAndStroke": true,
            "lineLabel": "",
            "showLineLabel": false,
            "lineLabelYPosition": 0, /* 0 is above, 1 is below */
            "lineLabelXPosition": "right", /* can be left, middle, right */
            "shadingStyle": 0 /* 0 is solid, 1 is striped */
        };
    }
});

var LineCollection = Backbone.Collection.extend({
    model: Line
});

var Label = Backbone.Model.extend({
    defaults: function() {
        return {
            text: "",
            visible: true,
            color: "black",
            position: {}
        };
    }
});

var LabelCollection = Backbone.Collection.extend({
    model: Label
});

var Point = Backbone.Model.extend({
    defaults: function() {
        return {
            "point": {},
            "color": "black",
            "radius": 4,
            "visible": false,
        };
    }
});

var PointCollection = Backbone.Collection.extend({
    model: Point
});

var Axis = Backbone.Model.extend({
    defaults: function() {
        return {
            "xAxis": true,
            "label": "",
            "ticks": [],
            "min": 0,
            "max": 100,
            tickFormatFunction: function(d) {
                if (d == params.minXValue || d == params.maxXValue) {
                    return "" + d;
                }
                else {
                    return params.x_intercept_label + roundedString(d, params.maxXValue);
                }
            },
            textAnchorFunction: function(d, context) {
                return (d == context.get("min") || d == context.get("max")) ? "end" : "middle";
            },
            dYFunction: function(d, context) {
                return (d == context.get("min") || d == context.get("max")) ? ".32em" : "-1em";
            },
            transformFunction: function(d, context) {
                return (d == context.get("min") || d == context.get("max")) ? "rotate(0)" : "rotate(270)";
            }
        };
    },
});

var AxisCollection = Backbone.Collection.extend({
    model: Axis
});

var ShadedArea = Backbone.Model.extend({
    defaults: function() {
        return {
            "data": [],
            "y0_function": null,
            "y1_function": null,
            "area_element": null,
            "shade_on": true,
            "shade_color": "black",
            "label": "",
            "label_position": {},
            "label_on": true,
            "label_element": null
        };
    }
});

var ShadedAreaCollection = Backbone.Collection.extend({
    model: ShadedArea
});

var Graph = Backbone.Model.extend({
    defaults: function() {
        return {
            /* Set all default values here - namely parameters and axes */
            "lines": new LineCollection(),
            "points": new PointCollection(),
            "shadedAreas": new ShadedAreaCollection(),
            "labels": new LabelCollection(),
            "_axes": new AxisCollection(),
            "name": "",
            "minXValue": 0,
            "maxXValue": 100,
            "minYValue": 0,
            "maxYValue": 100,
            "xAxisLabel": "",
            "yAxisLabel": "",
            "xAxisTicks": [0, 100],
            "yAxisTicks": [0, 100],
            "parameters": {},
            "shade": true,

            "touchIsActive": false,
            "touchedLine": "",
            "touchedPoint": {'x': 0, 'y': 0},
            "initialTouchedPoint": {'x': 0, 'y': 0}
        };
    },

    initializeAxes: function() {
        axes = this.get("_axes");
        params = this.get("parameters");
        xAxis = new Axis({
            xAxis: true,
            label: params.x_label,
            ticks: [params.minXValue, params.maxXValue],
            min: params.minXValue,
            max: params.maxXValue
        });

        yAxis = new Axis({
            xAxis: false,
            label: params.y_label,
            ticks: [params.minYValue, params.maxYValue],
            min: params.minYValue,
            max: params.maxYValue
        });

        axes["xAxis"] = xAxis;
        axes["yAxis"] = yAxis;
    },

    touchBegan: function(x, y) {
        return false;
    },

    touchMoved: function(x,y) {
        return false;
    },

    touchEnded: function() {

    }
});

var GraphView = Backbone.View.extend({
    el: "#containerView",
    model: new Graph(),
    _lines: {},
    _points: {},
    _shadedAreas: {},
    _shadedAreaFormats: {},
    _axes: {},
    _axisFormats: {},
    _axisLabels: {},
    _labels: {},

    options: {
        margin: {top: 10, right: 10, bottom: 35, left: 35}
    },

    initialize: function() {
        this.options = _.extend({}, this.defaults, this.options);
        this.model.get("lines").on("change", function(line) {
            this.drawLine(line.id);
        }, this);
        this.model.get("shadedAreas").on("change", function(area) {
            this.drawShadedArea(area);
        }, this);
        this.model.get("_axes").on("change", function(axis) {
            if (axis.get("xAxis")) {
                this.updateXScale();
            }
            else {
                this.updateYScale();
            }
            this.drawAxis(axis, null, null);
            this.drawShadedAreas();
            this.drawLines();
            this.drawPoints();
        }, this);
        this.model.get("points").on("change", function(point) {
            this.drawPoint(point);
        }, this);
        this.model.get("labels").on("change", function(label) {
            this.drawLabel(label);
        }, this);
    },

    render: function() {
        var margin = this.options.margin;
        this.width = this.$el.width() - margin.left - margin.right;
//        this.height = $("#containerView").height() - margin.top - margin.bottom;
        this.height = this.$el.height() - margin.top - margin.bottom;


        this.svg = d3.select(this.el).append("svg")
              .attr("width", this.width + margin.left + margin.right)
              .attr("height", this.height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this.lineFormat = d3.svg.line()
          .interpolate("linear");

        this.initializeXScale();
        this.initializeYScale();

        this.renderShadedAreas();
        this.renderLines();
        this.renderAxes();
        this.renderPoints();
        this.renderLabels();

        _this = this;

        this.overlay = this.svg.append("rect")
          .attr("class", "overlay")
          .attr("width", this.width)
          .attr("height", this.height)
          .datum({})
          .on("mousedown", function(d, i) {
            _this.mousedown(this);
          })
          .on("touchstart", function(d, i) {
            _this.touchdown(this);
          })
          .on("mouseup", function(d, i) {
            _this.mouseup();
          })
          .on("touchup", function(d, i) {
            this.touchup();
          });
        return this;
    },

    resize: function() {
        var margin = this.options.margin;
        this.width = this.$el.width() - margin.left - margin.right;
        this.height = this.$el.height() - margin.top - margin.bottom;

        this.svg.attr("width", this.width + margin.left + margin.right)
              .attr("height", this.height + margin.top + margin.bottom);

        this.resizeAxes();

        this.overlay.attr("width", this.width)
          .attr("height", this.height);
    },

    mousedown: function(context) {
        _this = this;
        e = d3.mouse(context);
        x = this.reverse_x_scale(e[0]);
        y = this.reverse_y_scale(e[1]);
        if (this.model.touchBegan(x, y)) {
            this.overlay.on("mousemove", function(d, i) {
                d3.event.preventDefault();
                e = d3.mouse(this);
                x = _this.reverse_x_scale(e[0]);
                y = _this.reverse_y_scale(e[1]);
                _this.model.touchMoved(x, y);
            });
        }
        d3.event.preventDefault();
    },

    touchdown: function(context) {
        _this = this;
        e = d3.touches(context)[0];
        x = this.reverse_x_scale(e[0]);
        y = this.reverse_y_scale(e[1]);
        if (this.model.touchBegan(x, y)) {
            this.overlay.on("touchmove", function(d, i) {
                d3.event.preventDefault();
                e = d3.touches(this)[0];
                x = _this.reverse_x_scale(e[0]);
                y = _this.reverse_y_scale(e[1]);
                _this.model.touchMoved(x, y);
            });
        }
        d3.event.preventDefault();
    },

    mouseup: function() {
        this.model.touchEnded();
        this.overlay.on("mousemove", null);
    },

    touchup: function() {
        this.model.touchEnded();
        this.overlay.on("touchmove", null);
    },

    initializeXScale: function() {
        params = this.model.get("parameters");

        this.x_scale = d3.scale.linear()
          .range([0, this.width])
          .domain([params.minXValue, params.maxXValue]);

        this.reverse_x_scale = d3.scale.linear()
          .range([params.minXValue, params.maxXValue])
          .domain([0, this.width]);

        this.lineFormat.x(function(d) {
            return this.x_scale(d.x);
        });

        this.updateXAreas();
    },

    updateXScale: function() {
        params = this.model.get("parameters");

        this.x_scale = d3.scale.linear()
          .range([0, this.width])
          .domain([params.minXValue, params.maxXValue]);

        this.reverse_x_scale = d3.scale.linear()
          .range([params.minXValue, params.maxXValue])
          .domain([0, this.width]);

        this.drawAxis(this.model.get("_axes").get("xAxis"), this.x_scale, null);

        this.lineFormat.x(function(d) {
            return this.x_scale(d.x);
        });

        this.updateXAreas();
    },

    initializeYScale: function() {
        params = this.model.get("parameters");
        this.y_scale = d3.scale.linear()
          .range([this.height, 0])
          .domain([params["minYValue"], params["maxYValue"]]);

        this.reverse_y_scale = d3.scale.linear()
          .range([params["minYValue"], params["maxYValue"]])
          .domain([this.height, 0]);

        this.lineFormat.y(function(d) {
            return this.y_scale(d.y);
        });

        this.updateYAreas();
    },

    updateYScale: function() {
        params = this.model.get("parameters");
        this.y_scale = d3.scale.linear()
          .range([this.height, 0])
          .domain([params["minYValue"], params["maxYValue"]]);

        this.reverse_y_scale = d3.scale.linear()
          .range([params["minYValue"], params["maxYValue"]])
          .domain([this.height, 0]);

        this.drawAxis(this.model.get("_axes").get("yAxis"), this.y_scale, null);

        this.lineFormat.y(function(d) {
            return this.y_scale(d.y);
        });

        this.updateYAreas();
    },

    updateXAreas: function() {
         var xAreaFormatFunction = function(context) {
            return function(d) {
                return context.x_scale(d.x);
            };
        };

        for (var key in this._shadedAreaFormats) {
            format = this._shadedAreaFormats[key];
            format.x(xAreaFormatFunction(this));
        }
    },

    updateYAreas: function() {
        var yAreaFormatFunction = function(context, y_function) {
            return function(d) {
                return context.y_scale(y_function(d));
            };
        };

        for (var key in this._shadedAreaFormats) {
            format = this._shadedAreaFormats[key];
            shadedArea = this.model.get("shadedAreas").get(key);
            format.y0(yAreaFormatFunction(this, shadedArea.get("y0_function")));
            format.y1(yAreaFormatFunction(this, shadedArea.get("y1_function")));
        }
    },

    renderLines: function() {
        this.model.get("lines").each(function(line) {
            this.renderLine(line);
            this.drawLine(line.id);
        }, this);
    },

    renderLine: function(line) {
        var path = this.svg.append("path");
        this._lines[line.id] = path;
    },

    drawLines: function() {
        this.model.get("lines").each(function(line) {
            this.drawLine(line.id);
        }, this);
    },

    drawLine: function(line) {
        path = this._lines[line];
        lineModel = this.model.get("lines").get(line);
        path.attr("visibility", lineModel.get("active") ? "visible" : "hidden")
          .style({
            "stroke": lineModel.get("lineColor"),
            "stroke-dasharray": lineModel.get("lineStyle"),
            "stroke-width": lineModel.get("lineThickness")
          })
          .attr("d", this.lineFormat(lineModel.get("points")));
    },

    renderAxes: function() {
        xAxis = this.model.get("_axes").get("xAxis");
        yAxis = this.model.get("_axes").get("yAxis");

        this.renderAxis(xAxis);
        this.renderAxis(yAxis);

        this.drawAxis(xAxis, this.x_scale, "bottom");
        this.drawAxis(yAxis, this.y_scale, "left");

    },

    renderAxis: function(axis) {
        var el = this.svg.append("g")
          .attr("class", "axis");
        var format = d3.svg.axis();
        var label = this.svg.append("text");

        if (axis.get("xAxis")) {
            el.attr("transform", "translate(0," + this.height + ")");
            label.attr("x", this.width / 2)
              .attr("y", this.height + 30)
              .style({
                "text-anchor": "middle"
              });
        }
        else {
            label.attr("x", -this.height / 2)
              .attr("y", -25)
              .style({
                "text-anchor": "middle"
              })
              .attr("transform", function (d, i) {
                return "rotate(270)";
              });
        }

        this._axes[axis.id] = el;
        this._axisFormats[axis.id] = format;
        this._axisLabels[axis.id] = label;
    },

    resizeAxes: function() {
        xAxis = this.model.get("_axes").get("xAxis");
        yAxis = this.model.get("_axes").get("yAxis");

        this.resizeAxis(xAxis);
        this.resizeAxis(yAxis);
    },

    resizeAxis: function(axis) {
        el = this._axes[axis.id];
        label = this._axisLabels[axis.id];
        if (axis.get("xAxis")) {
            el.attr("transform", "translate(0," + this.height + ")");
            label.attr("x", this.width / 2)
              .attr("y", this.height + 30);
        }
        else {
            label.attr("x", 0 - 30)
              .attr("y", this.height / 2);
        }
    },

    drawAxis: function(axis, scale, orientation) {
        _this = this;
        format = this._axisFormats[axis.id];
        el = this._axes[axis.id];
        label = this._axisLabels[axis.id];

        if (scale) {
            format.scale(scale);
        }
        if (orientation) {
            format.orient(orientation);
        }

        format.tickValues(axis.get("ticks"))
          .tickFormat(function(d) {
            return axis.get("tickFormatFunction")(d, _this.model.get("parameters"));
        });
        el.call(format)
          .selectAll("text")
          .style("text-anchor", function(d, i) {
            return axis.get("textAnchorFunction")(d, axis);
          })
          .attr("dy", function(d, i) {
            return axis.get("dYFunction")(d, axis);
          })
          .attr("transform", function(d, i) {
            return axis.get("transformFunction")(d, axis);
          });

        label.text(axis.get("label"));
    },

    renderShadedAreas: function() {
        this.model.get("shadedAreas").each(function(area) {
            this.renderShadedArea(area);
        }, this);

        this.updateXAreas();
        this.updateYAreas();

        this.model.get("shadedAreas").each(function(area) {
            this.drawShadedArea(area);
        }, this);
    },

    renderShadedArea: function(shadedArea) {
        var areaFormat = d3.svg.area();
        this._shadedAreaFormats[shadedArea.id] = areaFormat;

        var area = this.svg.append("path");
        this._shadedAreas[shadedArea.id] = area;
    },

    drawShadedAreas: function() {
        this.model.get("shadedAreas").each(function(area) {
            this.drawShadedArea(area);
        }, this);
    },

    drawShadedArea: function(shadedArea) {
        areaFormat = this._shadedAreaFormats[shadedArea.id];
        area = this._shadedAreas[shadedArea.id]
          .style({
              fill: (shadedArea.get("shade_on")) ? shadedArea.get("shade_color") : "rgba(0,0,0,0)",
              "stroke-width": 0
          })
          .datum(shadedArea.get("data"))
          .attr("d", areaFormat);
    },

    renderPoints: function() {
        this.model.get("points").each(function(point) {
            this.renderPoint(point);
            this.drawPoint(point);
        }, this);
    },

    renderPoint: function(point) {
        var el = this.svg.append("circle");
        this._points[point.id] = el;
    },

    drawPoints: function() {
        this.model.get("points").each(function(point) {
            this.drawPoint(point);
        }, this);
    },

    drawPoint: function(point) {
        p = point.get("point");
        el = this._points[point.id]
          .style({
            fill: point.get("color")
          })
          .attr("r", point.get("radius"))
          .attr("cx", this.x_scale(p.x))
          .attr("cy", this.y_scale(p.y))
          .attr("visibility", point.get("visible") ? "visible" : "hidden");
    },

    renderLabels: function() {
        this.model.get("labels").each(function(label) {
            this.renderLabel(label);
            this.drawLabel(label);
        }, this);
    },

    renderLabel: function(label) {
        this._labels[label.id] = this.svg.append("text");
    },

    drawLabel: function(label) {
        pos = label.get("position");
        el = this._labels[label.id]
          .attr("x", this.x_scale(pos.x))
          .attr("y", this.y_scale(pos.y))
          .attr("visibility", label.get("visible") ? "visible": "hidden")
          .style({
            fill: label.get("color")
          })
          .text(label.get("text"));
    }
});

/*
var Label = Backbone.Model.extend({
    defaults: function() {
        return {
            text: "",
            visible: true,
            color: "black",
            position: {}
        };
    }
});

 */

convertToOptionsHash = function(graph) {
    var params = graph.get("parameters");
    var options = {
        title: graph.get("name"),
        axesDefaults: {
            pad: 0
        },
        grid: {
            drawGridLines: false,
            gridLineColor: '#FFFFFF',
            shadow: false,
            background: '#FFFFFF',
            borderColor: '#333333',
            borderWidth: 0.2
        },
        seriesDefaults: {
            showMarker: false,
            xaxis: 'xaxis',
            yaxis: 'yaxis',
            fillAndStroke: true,
            fill: true,
            shadow: false,
            useNegativeColors: false,
            rendererOptions: {
                highlightMouseOver: false,
                highlightMouseDown: false
            }
        }
    };
    var xAxis = {
        min: params["minXValue"],
        max: params["maxXValue"],
        ticks: graph.get("xAxisTicks"),
        label: params["xAxisLabel"],
        labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
        tickRenderer: $.jqplot.CanvasAxisTickRenderer,
        tickOptions: {
            labelPosition: 'end',
            showMark: false
        }
    };
    var yAxis = {
        min: params["minYValue"],
        max: params["maxYValue"],
        ticks: graph.get("yAxisTicks"),
        label: params["yAxisLabel"],
        labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
        tickRenderer: $.jqplot.CanvasAxisTickRenderer,
        tickOptions: {
            fontSize: '10pt',
            labelPosition: 'middle',
            showMark: false
        }
    };

    options.axes = {xaxis: xAxis, yaxis: yAxis};

    options.data = [];
    options.series = [];

    var graphLines = graph.get("lines"), i, line;
    for (i = 0; i < graphLines.length; i++) {
        line = graphLines[i];
        hashFromLine(line, options);
    }

    return options;
};

inRange = function(x, min, max) {
    return x >= min && x <= max;
};

clearLineLabels = function() {
    $(".lineLabel").remove();
};

addLineLabels = function(plot, graph) {
    var graphLines = graph.get("lines");
    for (var i = 0; i < graphLines.length; i++) {
        var line = graphLines[i];
        if (line.get("showLineLabel")) {
            addLineLabel(graph, plot, line);
        }
    }
};

addLineLabel = function(graph, plot, line) {
    if (line.get("showLineLabel")) {
        var div = $("<div/>", {
            "class": "lineLabel",
            text: line.get("lineLabel")
        }).appendTo("#containerView");

        var linePosition = positionOfLineLabel(graph, plot, line);
        $(div).css("left", linePosition.x - $(div).width() / 2);
        $(div).css("top", linePosition.y - $(div).height() / 2);

    }
};

touchMoved = function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    var touch = translateTouch(e);
    e.data.graph.singleTouchMoved(touch);
};

/**
touchDown = function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    var touch = translateTouch(e);
    var touchedLine = detectTouch(touch);
    if (touchedLine > -1) {
        e.data.graph.singleTouchBegan(touch, touchedLine, 0);
        $(e.data.plot).on("mousemove", {plot: plot1, graph: graph}, touchMoved);
    }
};
*/
translateTouch = function(e) {
    var goMoved = e.data.plot.eventCanvas._elem.offset();
    var gridPos = {x:e.pageX - goMoved.left, y:e.pageY - goMoved.top};
    var xPos = e.data.plot.axes['xaxis'].series_p2u(gridPos['x']);
    var yPos = e.data.plot.axes['yaxis'].series_p2u(gridPos['y']);

    var graphWidth = e.data.graph.get("maxXValue") - e.data.graph.get("minXValue");
    var graphHeight = e.data.graph.get("maxYValue") - e.data.graph.get("minYValue");

    return {
        'x': xPos,
        'y': yPos
    };
};

detectTouch = function(graph, point) {
    var lines = graph.get("lines");
    var points = lines[0].get("points");
    var closestLine = 0;
    var closestPoint = points[0];
    var closestDistance = relativePointDistance(graph, point, closestPoint);
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line.get("active")) {
            continue;
        }
        points = line.get("points");
        for (var j = 0; j < points.length; j++) {
            var gPoint = points[j];
            var dist = relativePointDistance(graph, point, gPoint);
            if (dist <= closestDistance) {
                closestDistance = dist;
                closestLine = i;
                closestPoint = gPoint;
            }
        }
    }
    /*
    var graphWidth = graph.get("maxXValue") - graph.get("minXValue");
    var graphHeight = graph.get("maxYValue") - graph.get("minYValue");
    */
   var params = graph.get("parameters");
   var graphWidth = params["maxXValue"] - params["minXValue"];
   var graphHeight = params["maxYValue"] - params["minYValue"];

    /* Check if the x and y distances are within 10% of the graph width and height */
    var xRange = graphWidth / 10;
    var yRange = graphHeight / 10;
    if (Math.abs(point.x - closestPoint[0]) < xRange && Math.abs(point.y - closestPoint[1]) < yRange) {
        return closestLine;
    }
    return -1;
};

positionOfLineLabel = function(graph, plot, line) {
    var xPosition = line.get("lineLabelXPosition");
    var points = line.get("points");
    var point;
    if (xPosition === "right") {
        // grab the 90th percentile point
        point = firstPointInGraph(graph, line, true);
//      point = points[Math.floor(points.length * 0.9)];
    }
    else if (xPosition === "middle") {
        point = points[Math.floor(points.length * 0.5)];
    }
    else {
        point = firstPointInGraph(graph, line, false);
//      point = points[Math.floor(points.length * 0.1)];
    }
    var yPosition = line.get("lineLabelYPosition");
    var y = point[1] + ((yPosition === 0) ? 5 : -5);
    return translateOntoScreen(plot, {x: point[0], y: y});
};

/* Find the first point in the line that is on the graph */
firstPointInGraph = function(graph, line, right) {
    var point, points, i, yVal;
    if (right) {
        points = line.get("points");
        for (i = points.length - 1; i >= 0; i--) {
            point = points[i];
            yVal = point[1];
            if (inGraph(graph, {x:point[0], y:point[1]})) {
                return point;
            }
        }
        return points[points.length - 1];
    }
    else {
        var yDiff = yMax - yMin;
        points = line.get("points");
        for (i = 0; i < points.length; i++) {
            point = points[i];
            yVal = point[1];
            if (inGraph(graph, {x:point[0], y:point[1]})) {
                return point;
            }
        }
        return points[0];
    }
};

inGraph = function(graph, point) {
    var params = graph.get("parameters");
    var yMin = params["minYValue"];
    var yMax = params["maxYValue"];
    var xMin = params["minXValue"];
    var xMax = params["maxXValue"];
    var yDiff = yMax - yMin;
    var xDiff = xMax - xMin;

    var xBuffer = 0.05;
    var yBuffer = 0.1;

    var xMinBuff = xMin + xBuffer * xDiff;
    var xMaxBuff = xMax - xBuffer * xDiff;
    var yMinBuff = yMin + yBuffer * yDiff;
    var yMaxBuff = yMax - yBuffer * yDiff;
    return (point.x > xMinBuff && point.x < xMaxBuff && point.y > yMinBuff && point.y < yMaxBuff);
};

hashFromLine = function(line, options) {
    var hash = {};
    hash['show'] = line.get("active");
    hash['fillColor'] = line.get("fillColor") || "rgb(255, 255, 255)";
    hash['color'] = line.get('lineColor') || "rgb(0, 0, 0)";
    hash['fill'] = line.get("fillOn");
    hash['fillAndStroke'] = line.get("fillAndStroke");
    hash['lineWidth'] = line.get("lineThickness");
    hash['linePattern'] = (line.get("lineStyle") === 0) ? 'solid' : 'dashed';
    hash["showLine"] = line.get("showLine");
    hash['showMarker'] = line.get("showMarker");
    options.series.push(hash);
    options.data.push(line.get("points"));
};

plotSurpluses = function(plot, graph, extension) {
    extension = extension || "";
    var surpluses = graph.get("surpluses");
    var surplusElements = $(".surplus" + extension);
    $(".surplus" + extension).each(function(i, surplusEl) {
        if (i >= surpluses.length) return;
        var surplus = surpluses[i];
        var position = translateOntoScreen(plot, surplus.get("position"));
        $(surplusEl).text(surplus.get("name") + ": " + surplus.get("value"));
        $(surplusEl).css("left", position.x - $(surplusEl).width() / 2);
        $(surplusEl).css("top", position.y - $(surplusEl).height() / 2);
    });
};

translateOntoScreen = function(plot, point) {
    var offset = plot.eventCanvas._elem.offset();
    var xPos = plot.axes['xaxis'].series_u2p(point.x);
    var yPos = plot.axes['yaxis'].series_u2p(point.y);
    var pos = {x:offset.left + xPos, y:offset.top + yPos};
    return pos;
};

pointDistance = function(p1, p2) {
    var x1 = p1.x;
    var y1 = p1.y;
    var x2 = p2[0];
    var y2 = p2[1];
    var xDist = x1 - x2;
    var yDist = y1 - y2;
    return Math.sqrt((xDist * xDist) + (yDist * yDist));
};

relativePointDistance = function(graph, p1, p2) {
    var params = graph.get("parameters");
    var width = params["maxXValue"] - params["minXValue"];
    var height = params["maxYValue"] - params["minYValue"];
    var x1 = p1.x;
    var y1 = p1.y;
    var x2 = p2[0];
    var y2 = p2[1];
    var xDist = (x1 - x2) / width;
    var yDist = (y1 - y2) / height;
    return Math.sqrt((xDist * xDist) + (yDist * yDist));
};

roundedString = function(value, axis) {
    var log = Math.floor(log10(0.99 * axis));
    if (log <= 3) {
        return parseFloat(value.toFixed(3 - log));
    }
    return value;
};

function bound(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

log10 = function(val) {
    return Math.log(val) / Math.LN10;
};
