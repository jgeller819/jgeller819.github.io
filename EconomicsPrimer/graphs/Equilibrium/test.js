var d_int = 100,
      d_slope = -1,
      s_int = 0,
      s_slope = 1,
      X_MIN = 0,
      X_MAX = 100,
      Y_MIN = 0,
      Y_MAX = 100,
      steps = 500,
      y_int = 100,
      x_int = 100,
      y_int_data = [],
      x_int_data = [],
      y_int_string = "P* = ",
      x_int_string = "Q* = ",
      cs_string = "CS = ",
      ps_string = "PS = ",
      consumer_surplus_value = 1250,
      producer_surplus_value = 1250,
      demandData = [],
      supplyData = [],
      dwlData = [];

function demandFunc(x) {
    return d_slope * x + d_int;
}

function supplyFunc(x) {
    return s_slope * x + s_int;
}

function appendData() {
    y_int_data = [];
    x_int_data = [];
    demandData = [];
    supplyData = [];
    dwlData = [];
    /* y = d_slope * x + d_int = s_slope * x + s_int */
    /* x = (s_int - d_int) / (d_slope - s_slope) */

    x_int = (s_int - d_int) / (d_slope - s_slope);
    y_int = d_slope * x_int + d_int;

    if (validX(x_int) && validY(y_int)) {
        x_int_data = [{x: x_int, y: 0}, {x: x_int, y: y_int}];
        y_int_data = [{x: 0, y: y_int}, {x: x_int, y: y_int}];
        consumer_surplus_value = 0.5 * (x_int - X_MIN) * (d_int - y_int);
        producer_surplus_value = 0.5 * (x_int - X_MIN) * (y_int - s_int);
        if (s_int < Y_MIN) {
            /**
             * Y_MIN = s_slope * x + s_int
             * x = (Y_MIN -s_int) / s_slope
             */
            xZero = (Y_MIN - s_int) / s_slope;
            producer_surplus_value -= 0.5 * (xZero - X_MIN) * (Y_MIN - s_int);
        }
    }

    var x_width = X_MAX - X_MIN;
    for (var i = 0; i <= steps; i++) {
        var x = X_MIN + (i / steps) * x_width;
        dem = demandFunc(x);
        sup = supplyFunc(x);
        var demandValid = validY(dem);
        var supplyValid = validY(sup);
        if (demandValid) {
            demandData.push({x: x, y: dem});
        }
        if (supplyValid) {
            supplyData.push({x: x, y: sup});
        }
        if (dem >= sup && dem >= Y_MIN && sup <= Y_MAX) {
            dem = Math.min(Y_MAX, dem);
            sup = Math.max(Y_MIN, sup);
            dwlData.push({x: x, dem: dem, sup: sup});
        }
    }
}

function validX(x) {
    return x > 0;
//    return inRange(x, X_MIN, X_MAX);
}

function validY(y) {
    return inRange(y, Y_MIN, Y_MAX);
}

function inRange(x, min, max) {
    return x >= min && x <= max;
}

var margin = {top: 10, right: 10, bottom: 35, left: 35},
//var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = $("#chart1").width() - margin.left - margin.right,
    height = $("#chart1").height() - margin.top - margin.bottom;

var svg = d3.select("#chart1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var x_scale = d3.scale.linear()
    .range([0, width])
    .domain([X_MIN, X_MAX]);

var reverse_x_scale = d3.scale.linear()
    .range([X_MIN, X_MAX])
    .domain([0, width]);

var y_scale = d3.scale.linear()
    .range([height, 0])
    .domain([Y_MIN, Y_MAX]);

var reverse_y_scale = d3.scale.linear()
    .range([Y_MAX, Y_MIN])
    .domain([0, height]);

var xAxis = d3.svg.axis()
    .scale(x_scale)
    .orient("bottom")
    .tickFormat(function(d) {
        if (d == X_MIN || d == X_MAX) {
            return "" + d;
        }
        else {
            return x_int_string + roundedString(d, X_MAX);
        }
    });

var yAxis = d3.svg.axis()
    .scale(y_scale)
    .orient("left")
    .tickFormat(function(d) {
        if (d == Y_MIN || d == Y_MAX) {
            return "" + d;
        }
        else {
            return y_int_string + roundedString(d, Y_MAX);
        }
    });

var line = d3.svg.line()
    .x(function(d) {
        return x_scale(d.x);
    })
    .y(function(d) {
        return y_scale(d.y);
    })
    .interpolate("linear");

var consumer_surplus_area = d3.svg.area()
    .x(function(d) { return x_scale(d.x); })
    .y0(function(d) { return y_scale(Math.min(d.dem, Y_MAX)); })
    .y1(function(d) {
        return y_scale(Math.min(Math.max(y_int, Y_MIN), Y_MAX));
    });

var producer_surplus_area = d3.svg.area()
    .x(function(d) { return x_scale(d.x); })
    .y1(function(d) { return y_scale(Math.max(d.sup, Y_MIN)); })
    .y0(function(d) {
        return y_scale(Math.max(Math.min(y_int, Y_MAX), Y_MIN));
    });

function mousedown() {
    var e = d3.mouse(this);
    var x = reverse_x_scale(e[0]);
    var y = reverse_y_scale(e[1]);
    if (y < Y_MIN || y > Y_MAX) {
        return;
    }
    var dem = demandFunc(x);
    var sup = supplyFunc(x);
    var allowableOffset = 0.05 * (Y_MAX - Y_MIN);
    if (y > (dem - allowableOffset) && y < (dem + allowableOffset)) {
        overlay.on("mousemove", demandMoved);
        demand.style({"stroke-width": 3});
    }
    else if (y > (sup - allowableOffset) && y < (sup + allowableOffset)) {
        overlay.on("mousemove", supplyMoved);
        supply.style({"stroke-width": 3});
    }
    d3.event.preventDefault();
}

function demandMoved() {
    d3.event.preventDefault();
    d3.event.stopPropagation();
    var e = d3.mouse(this);
    var x = reverse_x_scale(e[0]);
    var y = reverse_y_scale(e[1]);
    /** We have y = d_slope * x + d_int
          Then d_int = y - d_slope * x
    */
   d_int = y - d_slope * x;
   appendData();
   drawDWL();
   demand.attr("d", line(demandData));

   demandLabelPoint = demandData[Math.floor((demandData.length - 1) * 0.85)];

   demandLabel.attr("x", x_scale(demandLabelPoint.x));
   demandLabel.attr("y", y_scale(Math.min(demandLabelPoint.y, Y_MAX * 0.85)) - 15);

   drawIntercepts();
}

function supplyMoved() {
    d3.event.preventDefault();
    d3.event.stopPropagation();
    var e = translateTouch(d3.mouse(this));
    var x = e.x;
    var y = e.y;
    /** We have y = s_slope * x + s_int
          Then s_int = y - s_slope * x
    */
   s_int = y - s_slope * x;
   appendData();
   drawDWL();
   supply.attr("d", line(supplyData));

   demandLabelX = demandData[demandData.length - 1].x * 0.85;
   supplyLabelX = supplyData[supplyData.length - 1].x * 0.85;

   minYVal = Y_MIN + (Y_MAX - Y_MIN) * 0.05;
   maxYVal = Y_MAX - (Y_MAX - Y_MIN) * 0.1;

   supplyLabelY = bound(supplyFunc(supplyLabelX), minYVal, maxYVal);

   supplyLabel.attr("x", x_scale(supplyLabelX));
   supplyLabel.attr("y", y_scale(supplyLabelY) - 15);

   drawIntercepts();
}

function drawDWL() {
    consumer_surplus.datum(dwlData);
    producer_surplus.datum(dwlData);
    consumer_surplus.attr("d", consumer_surplus_area);
    producer_surplus.attr("d", producer_surplus_area);

    csText = "";
    psText = "";
    if (validX(x_int) && validY(y_int)) {
        if (y_scale(y_int) - y_scale(Y_MAX) > 25) {
            // Then show the consumer surplus
            csText = cs_string + consumer_surplus_value.toFixed(1);
            consumer_surplus_label.attr("y", y_scale(y_int) - 10);
        }
        if (y_scale(Y_MIN) - y_scale(y_int) > 25) {
            psText = ps_string + producer_surplus_value.toFixed(1);
            producer_surplus_label.attr("y", y_scale(y_int) + 20);
        }
    }
    consumer_surplus_label.text(csText);
    producer_surplus_label.text(psText);
}

function drawIntercepts() {
    if (validX(x_int) && validY(y_int)) {
        x_int_line.attr("d", line(x_int_data));
        y_int_line.attr("d", line(y_int_data));

        xAxis.tickValues([X_MIN, x_int, X_MAX]);
        x_axis.call(xAxis);

        yAxis.tickValues([Y_MIN, y_int, Y_MAX]);
        y_axis.call(yAxis)
        .selectAll("text")
        .style("text-anchor", function(d, ctx) {
            return (d == Y_MIN || d == Y_MAX) ? "end" : "middle";
        })
        .attr("dy", function(d, ctx) {
            return (d == Y_MIN || d == Y_MAX) ? ".32em" : "-1em";
        })
        .attr("transform", function(d, ctx) {
            return (d == Y_MIN || d == Y_MAX) ? "rotate(0)" : "rotate(270)";
        });

        intersection_point.attr("cx", x_scale(x_int))
        .attr("cy", y_scale(y_int))
        .attr("r", 4);
    }
    else {
     x_int_line.attr("d", line([]));
     y_int_line.attr("d", line([]));

       xAxis.tickValues([X_MIN, X_MAX]);
       x_axis.call(xAxis);

       yAxis.tickValues([Y_MIN, Y_MAX]);
       y_axis.call(yAxis);

        intersection_point.attr("r", 0);
    }
}

function translateTouch(e) {
    var x = reverse_x_scale(e[0]);
    var y = reverse_y_scale(e[1]);
    return({x: x, y: y});
}

function mouseup() {
    overlay.on("mousemove", null);
    demand.style({"stroke-width": 1});
    supply.style({"stroke-width": 1});
}

function initializeData() {
    appendData();
    drawDWL();
    demand.attr("d", line(demandData));
    supply.attr("d", line(supplyData));

    demandLabelX = demandData[demandData.length - 1].x * 0.85;
    supplyLabelX = supplyData[supplyData.length - 1].x * 0.85;

    minYVal = Y_MIN + (Y_MAX - Y_MIN) * 0.05;
    maxYVal = Y_MAX - (Y_MAX - Y_MIN) * 0.1;

    demandLabelY = bound(demandFunc(demandLabelX), minYVal, maxYVal);
    supplyLabelY = bound(supplyFunc(supplyLabelX), minYVal, maxYVal);

    demandLabel.attr("x", x_scale(demandLabelX));
    demandLabel.attr("y", y_scale(demandLabelY) - 15);

    supplyLabel.attr("x", x_scale(supplyLabelX));
    supplyLabel.attr("y", y_scale(supplyLabelY) - 15);

    initializeAxes();
    drawIntercepts();
}

function initializeAxes() {
    svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 30)
    .text("Q");

    svg.append("text")
    .attr("x", 0 - 30)
    .attr("y", height / 2)
    .text("P");
}

var consumer_surplus = svg.append("path")
    .style({"fill": "#66CD00", "stroke-width": 0});

var producer_surplus = svg.append("path")
    .style({"fill": "#FFEC8B", "stroke-width": 0});

var consumer_surplus_label = svg.append("text")
    .attr("x", x_scale(X_MIN + 0.05 * (X_MAX - X_MIN)));

var producer_surplus_label = svg.append("text")
    .attr("x", x_scale(X_MIN + 0.05 * (X_MAX - X_MIN)));

var demand = svg.append("path")
  .style({"stroke": "blue"});

var demandLabel = svg.append("text")
    .text("D");

var supply = svg.append("path")
  .style({"stroke": "red"});

var supplyLabel = svg.append("text")
    .text("S");

var x_axis = svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")");

var y_axis = svg.append("g")
    .attr("class", "axis");

var x_int_line = svg.append("path")
    .style({"stroke": "black",
        "stroke-dasharray": "10,10",
        "stroke-linecap": "round",
        "stroke-width": 2
    });

var y_int_line = svg.append("path")
    .style({"stroke": "black",
        "stroke-dasharray": "10,10",
        "stroke-linecap": "round",
        "stroke-width": 2
    });

var intersection_point = svg.append("circle")
    .style({
        "fill": "black"
    })
    .attr("r", 4);

var overlay = svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .datum({})
    .on("mousedown", mousedown)
    .on("mouseup", mouseup);

function bound(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

function roundedString(value, axis) {
    var log = Math.floor(log10(0.99 * axis));
    if (log <= 3) {
        return parseFloat(value.toFixed(3 - log));
    }
    return value;
}

function log10(val) {
    return Math.log(val) / Math.LN10;
}

initializeData();
