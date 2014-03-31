var EquilibriumGraph = Graph.extend({
    initialize: function() {
        this.initializeLinesAndAreas();
        this.initializeAxes();
        this.updateLabels();
        this.updateSurplus();
    },

    defaults: function() {
        return {
            "name": "Equilibrium",
            "parameters": {
                "xAxisLabel": "Q",
                "yAxisLabel": "P",
                "minXValue": 0,
                "maxXValue": 100,
                "minYValue": 0,
                "maxYValue": 100,

                "x_label": "Q",
                "x_label_orientation": "right",

                "y_label": "P",
                "y_label_orientation": "horizontal",

                "x_intercept": true,
                "x_intercept_texture": 1,
                "x_intercept_label": "Q* = ",
                "x_intercept_color": "brown",

                "y_intercept": true,
                "y_intercept_texture": 1,
                "y_intercept_label": "P* = ",
                "y_intercept_color": "brown",

                "demand_color": "#32315c",
                "demand_fill_color": "#3c592e",
                "demand_label": true,
                "demand_label_text": "D",

                "supply_color": "711d1f",
                "supply_fill_color": "3671bf",
                "supply_label": true,
                "supply_label_text": "S",

                "d_int": 100,
                "d_slope": -1,
                "d_int_inv": 100,
                "d_slope_inv": 1,
                "s_int": 0,
                "s_int_inv": 0,
                "s_slope": 1,
                "s_slope_inv": 1,

                "shade": true,
                "show_labels": true
            },

            "x_int": 50,
            "y_int": 50,

            "consumer_surplus_value": 1250,
            "producer_surplus_value": 1250,

            "lines": new LineCollection(),
            "points": new PointCollection(),
            "shadedAreas": new ShadedAreaCollection(),
            "labels": new LabelCollection(),
            "_axes": new AxisCollection(),

            "touched_line": null,
            "dirty": false,

            updateValue: function(name, value, context) {
                params = context.get("parameters");
                params[name] = value;
                if (name === "d_int_inv") {
                    params.d_int = -params.d_slope * value;
                }
                else if (name === "s_int_inv") {
                    params.s_int = -params.s_slope * value;
                }
                else if (name === "d_slope_inv") {
                    params.d_slope = -1 / value;
                    params.d_int = -params.d_slope * params.d_int_inv;
                }
                else if (name === "s_slope_inv") {
                    params.s_slope = 1 / value;
                    params.s_int = -params.s_slope * params.s_int_inv;
                }
                context.updateXAxis();
                context.updateYAxis();
                context.initializeLinesAndAreas();
                context.updateLabels();
                context.updateSurplus();
            }
        };
    },

    reset: function() {
        this.set({
            "parameters": {
                "xAxisLabel": "Q",
                "yAxisLabel": "P",
                "minXValue": 0,
                "maxXValue": 100,
                "minYValue": 0,
                "maxYValue": 100,

                "x_label": "Q",
                "x_label_orientation": "right",

                "y_label": "P",
                "y_label_orientation": "horizontal",

                "x_intercept": true,
                "x_intercept_texture": 1,
                "x_intercept_label": "Q* = ",
                "x_intercept_color": "brown",

                "y_intercept": true,
                "y_intercept_texture": 1,
                "y_intercept_label": "P* = ",
                "y_intercept_color": "brown",

                "demand_color": "#32315c",
                "demand_fill_color": "#3c592e",
                "demand_label": true,
                "demand_label_text": "D",

                "supply_color": "711d1f",
                "supply_fill_color": "3671bf",
                "supply_label": true,
                "supply_label_text": "S",

                "d_int": 100,
                "d_slope": -1,
                "d_int_inv": 100,
                "d_slope_inv": 1,
                "s_int": 0,
                "s_int_inv": 0,
                "s_slope": 1,
                "s_slope_inv": 1,

                "shade": true,
                "show_labels": true
            }
        });
        this.updateXAxis();
        this.updateYAxis();
        this.initializeLinesAndAreas();
        this.updateLabels();
        this.updateSurplus();
        this.set("dirty", true);
    },

    initializeLinesAndAreas: function() {
        params = this.get("parameters");
        steps = 500;
        demand_points = [];
        supply_points = [];

        surplusData = [];

        width = params.maxXValue - params.minXValue;
        for (var i = 0; i <= steps; i++) {
            x = params.minXValue + (i / steps) * width;
            dem = this.demandFunc(x);
            sup = this.supplyFunc(x);

            demandValid = inRange(dem, params.minYValue, params.maxYValue);
            supplyValid = inRange(sup, params.minYValue, params.maxYValue);

            if (demandValid) {
                demand_points.push({x: x, y: dem});
            }
            if (supplyValid) {
                supply_points.push({x: x, y: sup});
            }
            if (dem >= sup && dem >= params.minYValue && sup <= params.maxYValue) {
                dem = Math.min(params.maxYValue, dem);
                sup = Math.max(params.minYValue, sup);
                surplusData.push({x: x, dem: dem, sup: sup});
            }
        }

        this.set("demand_points", demand_points);
        this.set("supply_points", supply_points);

        x_int = (params.s_int - params.d_int) / (params.d_slope - params.s_slope);
        this.set("x_int", x_int);

        y_int = params.d_slope * x_int + params.d_int;
        this.set("y_int", y_int);

        demandLine = this.get("lines").get("demandLine") || new Line({
            id: "demandLine",
        });

        demandLine.set({
            points: demand_points,
            lineColor: params.demand_color
        });

        supplyLine = this.get("lines").get("supplyLine") || new Line({
            id: "supplyLine",
        });
        supplyLine.set({
            points: supply_points,
            lineColor: params.supply_color
        });

        showIntercepts = this.validIntersection();

        intersectionPoint = this.get("points").get("intercept") || new Point({
            id: "intercept"
        });
        intersectionPoint.set({
            point: {x: x_int, y: y_int},
            visible: showIntercepts
        });
        this.get("points").set(intersectionPoint, {remove: false});

        xInterceptLine = this.get("lines").get("xInterceptLine") || new Line({
            id: "xInterceptLine"
        });
        xInterceptLine.set({
            points: [{x: x_int, y: 0}, {x: x_int, y: y_int}],
            lineColor: params.x_intercept_color,
            lineStyle: "10,10",
            lineThickness: 2,
            active: showIntercepts
        });

        yInterceptLine = this.get("lines").get("yInterceptLine") || new Line({
            id: "yInterceptLine"
        });
        yInterceptLine.set({
            points: [{x: 0, y: y_int}, {x: x_int, y: y_int}],
            lineColor: params.y_intercept_color,
            lineStyle: "10,10",
            lineThickness: 2,
            active: showIntercepts
        });

        this.get("lines").set([demandLine, supplyLine, xInterceptLine, yInterceptLine], {remove: false});

        consumerSurplus = this.get("shadedAreas").get("consumerSurplus") || new ShadedArea({
            id: "consumerSurplus"
        });
        consumerSurplus.set({
            data: surplusData,
            y0_function: function(d) {
                return Math.min(d.dem, params.maxYValue);
            },
            y1_function: function(d) {
                return bound(y_int, params.minYValue, params.maxYValue);
            },
            shade_color: params.demand_fill_color,
            shade_on: params.shade
        });

        producerSurplus = this.get("shadedAreas").get("producerSurplus") || new ShadedArea({
            id: "producerSurplus"
        });
        producerSurplus.set({
            data: surplusData,
            y1_function: function(d) {
                return Math.max(d.sup, params.minYValue);
            },
            y0_function: function(d) {
                return bound(y_int, params.minYValue, params.maxYValue);
            },
            shade_color: params.supply_fill_color,
            shade_on: params.shade
        });

        this.get("shadedAreas").set(consumerSurplus, {remove: false});
        this.get("shadedAreas").set(producerSurplus, {remove: false});
    },

    updateLabels: function() {
        demand_points = this.get("demand_points");
        supply_points = this.get("supply_points");
        params = this.get("parameters");
        labels = this.get("labels");

        demandLabelX = demand_points[demand_points.length - 1].x * 0.85;
        supplyLabelX = supply_points[supply_points.length - 1].x * 0.85;

        minYVal = params.minYValue + (params.maxYValue - params.minYValue) * 0.1;
        maxYVal = params.maxYValue - (params.maxYValue -params.minYValue) * 0.15;
        yBuffer = 0.1 * (params.maxYValue - params.minYValue);

        demandLabelY = bound(this.demandFunc(demandLabelX), minYVal, maxYVal) + yBuffer;
        supplyLabelY = bound(this.supplyFunc(supplyLabelX), minYVal, maxYVal) + yBuffer;

        demandLabel = labels.get("demandLabel") || new Label({
            id: "demandLabel"
        });
        demandLabel.set({
            text: params.demand_label_text,
            position: {x: demandLabelX, y: demandLabelY}
        });

        supplyLabel = labels.get("supplyLabel") || new Label({
            id: "supplyLabel"
        });
        supplyLabel.set({
            text: params.supply_label_text,
            position: {x: supplyLabelX, y: supplyLabelY}
        });

        x_int = this.get("x_int");
        y_int = this.get("y_int");

        csLabel = labels.get("csLabel") || new Label({
            id: "csLabel"
        });
        psLabel = labels.get("psLabel") || new Label({
            id: "psLabel"
        });

        demand_points = this.get("demand_points");
        supply_points = this.get("supply_points");
        params = this.get("parameters");
        labels = this.get("labels");
        csLabel = labels.get("csLabel") || new Label({
            id: "csLabel"
        });
        psLabel = labels.get("psLabel") || new Label({
            id: "psLabel"
        });
        csLabel.set({
            visible: false
        });
        psLabel.set({
            visible: false
        });

        this.get("labels").set([demandLabel, supplyLabel, csLabel, psLabel], {remove: false});
    },

    updateSurplus: function() {
        demand_points = this.get("demand_points");
        supply_points = this.get("supply_points");
        params = this.get("parameters");
        labels = this.get("labels");
        csLabel = labels.get("csLabel") || new Label({
            id: "csLabel"
        });
        psLabel = labels.get("psLabel") || new Label({
            id: "psLabel"
        });

        if (x_int >= params.minXValue && y_int >= params.minYValue) {
            consumerSurplus = 0.5 * (x_int - params.minXValue) * (params.d_int - y_int);
            producerSurplus = 0.5 * (x_int - params.minXValue) * (y_int - params.s_int);

            yRange = (params.maxYValue - params.minYValue) * 0.1;
            xPoint = params.minXValue + 0.05 * (params.maxXValue - params.minXValue);
            if (params.s_int < params.minYValue) {
                xZero = (params.minYValue - params.s_int) / params.s_slope;
                producerSurplus -= 0.5 * (xZero - params.minXValue * (params.minYValue - params.s_int));
            }

            this.set("consumer_surplus_value", consumerSurplus);
            this.set("producer_surplus_value", producerSurplus);

            if (params.maxYValue - y_int > yRange) {
                /* There's enough room for the consumer surplus label */
                csPoint = {x: xPoint, y: y_int + yRange / 2};
                csLabel.set({
                    visible: params.show_labels,
                    position: csPoint,
                    text: "CS = " + consumerSurplus.toFixed(1)
                });
            }
            else {
                csLabel.set({
                    visible: false
                });
            }

            if (y_int - params.minYValue > yRange) {
                /* There's enough room for the producer surplus label */
                psPoint = {x: xPoint, y: y_int - yRange};
                psLabel.set({
                    visible: params.show_labels,
                    position: psPoint,
                    text: "PS = " + producerSurplus.toFixed(1)
                });
            }
            else {
                psLabel.set({
                    visible: false
                });
            }
        }
        else {
            csLabel.set({
                visible: false
            });
            psLabel.set({
                visible: false
            });
        }

        this.get("labels").set([csLabel, psLabel], {remove: false});
    },

    updateXAxis: function() {
        axes = this.get("_axes");
        params = this.get("parameters");
        xAxis = axes.get("xAxis") || new Axis({
            id: "xAxis",
            xAxis: true,

            textAnchorFunction: function(d, ctx) {
                return "middle";
            },
            dYFunction: function(d, ctx) { return ".75em"; },
            transformFunction: function(d, ctx) { return "rotate(0)"; }
        });
        ticks = this.validIntersection() ? [params.minXValue, x_int, params.maxXValue] : [params.minXValue, params.maxXValue];
        xAxis.set({
            label: params.x_label,
            ticks: ticks,
            tickFormatFunction: function(d, params) {
                if (d == params.minXValue || d == params.maxXValue) {
                    return "" + d;
                }
                else {
                    return params.x_intercept_label + roundedString(d, params.maxXValue);
                }
            },
            min: params.minXValue,
            max: params.maxXValue
        });
        axes.set(xAxis, {remove: false});
    },

    updateYAxis: function() {
        axes = this.get("_axes");
        params = this.get("parameters");
        yAxis = axes.get("yAxis") || new Axis({
            id: "yAxis",
            xAxis: false,

        });
        y_int = this.get("y_int");
        ticks = this.validIntersection() ? [params.minYValue, y_int, params.maxYValue] : [params.minYValue, params.maxYValue];
        yAxis.set({
            label: params.y_label,
            ticks: ticks,
            tickFormatFunction: function(d, params) {
                if (d == params.minYValue || d == params.maxYValue) {
                    return "" + d;
                }
                else {
                    return params.y_intercept_label + roundedString(d, params.maxYValue);
                }
            },
            min: params.minYValue,
            max: params.maxYValue
        });
        axes.set(yAxis, {remove: false});
    },

    validIntersection: function() {
        x_int = this.get("x_int");
        y_int = this.get("y_int");
        params = this.get("parameters");
        return (x_int >= params.minXValue) && (x_int <= params.maxXValue) && (y_int >= params.minYValue) && (y_int <= params.maxYValue);
    },

    initializeAxes: function() {
        this.updateXAxis();
        this.updateYAxis();
    },

    demandFunc: function(x) {
        params = this.get("parameters");
        return params.d_slope * x + params.d_int;
    },

    supplyFunc: function(x) {
        params = this.get("parameters");
        return params.s_slope * x + params.s_int;
    },


     touchBegan: function(x, y) {
        params = this.get("parameters");
        if (y < params.minYValue || y > params.maxYValue) {
            return;
        }
        var dem = this.demandFunc(x);
        var sup = this.supplyFunc(x);
        var allowableOffset = 0.05 * (params.maxYValue - params.minYValue);
        if (y > (dem - allowableOffset) && y < (dem + allowableOffset)) {
            this.set("touched_line", "demandLine");
            line = this.get("lines").get("demandLine");
            line.set("lineThickness", 3);
            return true;
        }
        else if (y > (sup - allowableOffset) && y < (sup + allowableOffset)) {
            this.set("touched_line", "supplyLine");
            line = this.get("lines").get("supplyLine");
            line.set("lineThickness", 3);
            return true;
        }
        else {
            this.set("touched_line", null);
            return false;
        }
    },

    touchMoved: function(x, y) {
        if (this.get("touched_line") == "demandLine") {
            this.demandMoved(x, y);
        }
        else if (this.get("touched_line") == "supplyLine") {
            this.supplyMoved(x, y);
        }
    },

    demandMoved: function(x, y) {
        params = this.get("parameters");
        params.d_int = y - params.d_slope * x;
        params.d_int_inv = -params.d_int / params.d_slope;

        this.initializeLinesAndAreas();
        this.updateXAxis();
        this.updateYAxis();
        this.updateLabels();
        this.set("dirty", true);
    },

    supplyMoved: function(x, y) {
        params = this.get("parameters");
        params.s_int = y - params.s_slope * x;
        params.s_int_inv = -params.s_int / params.s_slope;

        this.initializeLinesAndAreas();
        this.updateXAxis();
        this.updateYAxis();
        this.updateLabels();
        this.set("dirty", true);
    },

    touchEnded: function() {
        line = this.get("lines").get(this.get("touched_line"));
        line.set('lineThickness', 2);
        this.set("touched_line", null);
        this.updateSurplus();
        this.set("dirty", true);
    }

 });
$(document).ready(function() {
    model = new EquilibriumGraph();
    view = new GraphView({
        model: model
    });
    view.render();
    $(window).resize(function() {
        view.resize();
    });

    model.on("change:dirty", function() {
        updateParamsFromGraph();
        model.set("dirty", false, {silent: true});
    });

    $(".param").each(function(i, el) {
        $(el).data("pre", $(el).val());
    });

    updateGraphWithAnimation = function() {
        animationSteps = 100;

        var name = $(this).attr("name");
        params = model.get("parameters");
        before_change = Number($(this).data("pre"));
        after_change = Number($(this).val());
        step_size = (after_change - before_change) / animationSteps;
        $(this).data("pre", after_change);

        updateParameter = function(index) {
            model.get("updateValue")(name, before_change + index * step_size, model);
        };

        for (var i = 0; i <= animationSteps; i++) {
            window.setTimeout(updateParameter, 1, [i]);
        }
    };

    updateGraphWithoutAnimation = function() {
        var name = $(this).attr("name");
        params = model.get("parameters");
        after_change = $(this).val();
        $(this).data("pre", after_change);

        model.get("updateValue")(name, after_change, model);
    };

    animatedNames = ["maxXValue", "maxYValue", "d_int_inv", "s_int_inv", "d_slope_inv", "s_slope_inv"];
    for (var i = 0; i < animatedNames.length; i++) {
        $("input[name=" + animatedNames[i] + "]").change(updateGraphWithAnimation);
    }

    unanimatedNames = ["x_label", "y_label", "x_intercept_label", "y_intercept_label"];
    for (i = 0; i < animatedNames.length; i++) {
        $("input[name=" + unanimatedNames[i] + "]").change(updateGraphWithoutAnimation);
    }

    updateColor = function() {
        return function(color) {
            var name = $(this).attr("name");
            model.get("updateValue")(name, color.toHexString(), model);
        };
    };

    colors = ["demand_color", "supply_color", "demand_fill_color", "supply_fill_color"];
    for (i = 0; i < colors.length; i++) {
        var name = colors[i];
        color = model.get("parameters")[name];
        $("input[name=" + name + "]").spectrum({
            color: color,
            clickoutFiresChange: true,
            move: updateColor(),
            change: updateColor(),
            hide: updateColor()
        });
    }

    $("input[name=shadeRadio]").change(function() {
        model.get("updateValue")("shade", $("input[name=shadeRadio]:checked").val() === "on", model);
    });

    $("input[name=labelRadio]").change(function() {
        model.get("updateValue")("show_labels", $("input[name=labelRadio]:checked").val() === "on", model);
    });

    $("#reset").click(function(e) {
        e.preventDefault();
        model.reset();
    });


    updateParamsFromGraph = function() {
        params = model.get("parameters");
        $("input[name=d_int_inv").val(roundedString(params.d_int_inv, params.maxYValue));
        $("input[name=s_int_inv").val(roundedString(params.s_int_inv, params.maxYValue));
        $("input[name=consumer_surplus").val(model.get("consumer_surplus_value").toFixed(1));
        $("input[name=producer_surplus").val(model.get("producer_surplus_value").toFixed(1));
    };
});
