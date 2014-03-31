var Graph = Backbone.Model.extend({

    initialize: function() {
        // Set up the initial lines, intersections, and surpluses. Basically
        // call rebuildGraph
        this.rebuildGraph();
    },

    defaults: {
        // Set all default values here - namely parameters and axes
        "lines": [],
        "intersections": [],
        "surpluses": [],
        "name": "",
        "minXValue": 0,
        "maxXValue": 200,
        "minYValue": 0,
        "maxYValue": 100,
        "xAxisLabel": "",
        "yAxisLabel": "",
        "xAxisTicks": [0, 200],
        "yAxisTicks": [0, 100],
        "parameters": {},
        "shade": true,

        "touchIsActive": false,
        "touchedLine": 0,
        "touchedPoint": {'x': 0, 'y': 0},
        "initialTouchedPoint": {'x': 0, 'y': 0}
    },

    singleTouchBegan: function(point, lineIndex) {
        this.set("touchIsActive", true);
        this.set("initialTouchedPoint", point);
        this.set("touchedPoint", point);
        this.set("touchedLine", lineIndex);
        // Perhaps make that line darker?
        var lines = this.get("lines");
        var line = this.get("lines")[lineIndex];
        line.set("lineThickness", 5);
        replotGraph();
    },

    singleTouchMoved: function(point) {
        // Make an calculations that update variables involving the shifted
        // point, and then call rebuild graph
        if (this.get("touchIsActive")) {
            this.set("touchedPoint", point);
            this.processTouch();
            this.get("lines")[this.get("touchedLine")].set("lineThickness", 5);
            replotGraph();
        }
    },

    singleTouchEnded: function() {
        this.set("touchIsActive", false);
        this.set("touchedPoint", {'x': 0, 'y': 0});
        this.set("initialTouchedPoint", {'x': 0, 'y': 0});
        var lines = this.get("lines");
        lines[this.get("touchedLine")].set("lineThickness", 3);
        replotGraph();
    },

    // Handle the function
    processTouch: function() {
        console.log("well shit");
    },

    shiftLine: function(lineIndex) {
        // Add a new shift to the given line in some default direction by a
        // default amount that should take into account the axis sizes
    },

    removeShift: function(lineIndex) {
        // Remove a shift
    },

    rebuildGraph: function(replot) {
        // Do any necessary calculations to rebuild the graph here Parse the
        // parameters hash - it will include things like line1FillOn: false
        this.recalculateLines();
        this.recalculateIntersections();
        this.recalculateSurpluses();
    },

    recalculateLines: function() {
        // Use the parameters to rebuild the set of lines if necessary, or
        // just edit the existing set

        // this.lines[0].set(points: []);
    },

    recalculateIntersections: function() {

    },

    recalculateSurpluses: function() {

    },

    reset: function() {
        // Go back to any defaults, rebuild the set of lines, etc

        // var supply = new Line({points: [], ...})
        // this.set(lines: [supply, demand]);

        // Also fill the parameters with the default values
    },

    updateLocalVariables: function() {

    },

    indexOfPointInLine: function(point, lineIndex) {
        var points = this.get("lines")[lineIndex].get("points");
        var best = 0;
        var bestDistance = pointDistance(point, points[0]);
        for (var i = 1; i < points.length; i++) {
            var dist = pointDistance(point, points[i]);
            if (dist < bestDistance)  {
                bestDistance = dist;
                best = i;
            }
        }
        return best;
    }
});

var Line = Backbone.Model.extend({
    defaults: {
        "points": [],
        "fillColor": '#FFFFFF',
        "lineColor": '#000000',
        "fillOn": false,
        "lineThickness": 3,
        "lineStyle": 0, /* 0 is solid, 1 is dashed */
        "showMarker": false,
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
    }
});

var Intersection = Backbone.Model.extend({
    defaults: {
        "point": [],
        "show": false,
        "x_axis_label": "",
        "y_axis_label": ""
    }
});

var Surplus = Backbone.Model.extend({
    defaults: {
        "name": "",
        "value": 0,
        "position": null
    }
});

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

log10 = function(val) {
    return Math.log(val) / Math.LN10;
}
