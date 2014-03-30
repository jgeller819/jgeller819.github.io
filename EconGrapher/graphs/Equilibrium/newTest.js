var EquilibriumGraph = Graph.extend({
    initialize: function() {
        this.initializeAxes();
        this.initializeLinesAndAreas();
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
                "y_intercept_label": "Q* = ",
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
            },

            "lines": new LineCollection(),
            "points": {},
            "shadedAreas": new ShadedAreaCollection(),
            "_axes": {},

            "touched_line": null
        };
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

        x_int = (params.s_int - params.d_int) / (params.d_slope - params.s_slope);
        y_int = params.d_slope * x_int + params.d_int;

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

        this.get("lines").set(demandLine, {remove: false});
        this.get("lines").set(supplyLine, {remove: false});

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
            shade_color: params.demand_fill_color
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
            shade_color: params.supply_fill_color
        });

        this.get("shadedAreas").set(consumerSurplus, {remove: false});
        this.get("shadedAreas").set(producerSurplus, {remove: false});
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
        this.initializeLinesAndAreas();
    },

    supplyMoved: function(x, y) {
        params = this.get("parameters");
        params.s_int = y - params.s_slope * x;
        this.initializeLinesAndAreas();
    },

    touchEnded: function() {
        line = this.get("lines").get(this.get("touched_line"));
        line.set('lineThickness', 1);
        this.set("touched_line", null);
    }

 });

view = new GraphView({
    model: new EquilibriumGraph()
});
view.render();
