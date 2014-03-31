var EquilibriumGraph = Graph.extend({

  /** We set up the initial lines */
  initialize: function() {
    this.updateLocalVariables();
    var demandLine = this.generateDemandLine(true, true, 0);
    this.get("lines").push(demandLine);
    var centerLines = this.generateCenterLines();
    var pLine1 = centerLines[0];
    var pLine2 = centerLines[1];
    var qLine = centerLines[2];
    this.get("lines").push(pLine1);
    this.get("lines").push(pLine2);
    var supplyLine = this.generateFullSupplyLine(true, true, 0);
    this.get("lines").push(supplyLine);
    var secondDemand = this.generateDemandLine(false, true, 0);
    this.get("lines").push(secondDemand);
    this.get("lines").push(qLine);

    /* Reserving the spots after these initial lines for shifts */
    var firstDShift = this.generateDemandLine(false, false, 1);
    var secondDShift = this.generateDemandLine(false, false, 2);
    this.get("lines").push(firstDShift);
    this.get("lines").push(secondDShift);

    var firstSShift = this.generateFullSupplyLine(false, false, 1);
    var secondSShift = this.generateFullSupplyLine(false, false, 2);
    this.get("lines").push(firstSShift);
    this.get("lines").push(secondSShift);

    var intersectionLine = this.generateIntersectionLine();
    this.get("lines").push(intersectionLine);

    this.get("surpluses").push(this.generateConsumerSurplus());
    this.get("surpluses").push(this.generateProducerSurplus());
  },

  defaults: {
    "name": "Equilibrium",
    "parameters": {
       "xAxisLabel": "Q",
       "yAxisLabel": "P",
      "minXValue": 0,
      "maxXValue": 200,
      "minYValue": 0,
      "maxYValue": 100,
      "d_int_inv": 200,
      "d_slope_inv": 2,
      "s_int_inv": 0,
      "s_slope_inv": 2,
      "d_curve": 0.005,
      "d_vertex": 200,
      "s_curve": 0.005,
      "s_vertex": 0,
      'shade': true,
      'parabola': false
    },

    "lines": [],
    "intersections": [],
    "surpluses": [],

    "p*": 50,
    "q*": 100,
    "xAxisTicks": [0, [100, "Q* = 100"], 200],
    "yAxisTicks": [0, [50, "P* = 50"], 100],

    "d_a": 0,
    "d_b": -0.5,
    "d_b'": -0.5,
    "d_b''": -0.5,
    "d_c": 100,
    "d_c'": 110,
    "d_c''": 90,
    "s_a": 0,
    "s_b": 0.5,
    "s_b'": 0.5,
    "s_b''": 0.5,
    "s_c": 0,
    "s_c'": 10,
    "s_c''": -10,

    "d_int_inv'": 220,
    "s_int_inv'": 20,
    "d_int_inv''": 180,
    "s_int_inv''": -20,

    "d_vertex'": 200,
    "s_vertex'": 0,
    "d_vertex''": 200,
    "s_vertex''": 0,

    "demandShiftCount": 0,
    "supplyShiftCount": 0,

    "touchIsActive": false,
    "touchedLine": 0,
    "touchedPoint": null
  },

  rebuildGraph: function(replot) {
    this.updateLocalVariables();
    this.recalculateLines();
    this.recalculateSurpluses();
    this.recalculateIntersections();
    if (replot) {
      replotGraph();
    }
  },

  recalculateLines: function() {

    this.get("lines")[0] = this.generateDemandLine(true, true, 0);
    var centerLines = this.generateCenterLines();
    this.get("lines")[1] = centerLines[0];
    this.get("lines")[2] = centerLines[1];
    var supplyLine = this.generateFullSupplyLine(true, true, 0);
    this.get("lines")[3] = supplyLine;
    var secondDemand = this.generateDemandLine(false, true, 0);
    this.get("lines")[4] = secondDemand;
    this.get("lines")[5] = centerLines[2];

    /* Reserving the spots after these initial lines for shifts */
    var firstDShift = this.generateDemandLine(false, this.get("demandShiftCount") >= 1, 1);
    var secondDShift = this.generateDemandLine(false, this.get("demandShiftCount") >= 2, 2);
    this.get("lines")[6] = firstDShift;
    this.get("lines")[7] = secondDShift;

    var firstSShift = this.generateFullSupplyLine(false, this.get("supplyShiftCount") >= 1, 1);
    var secondSShift = this.generateFullSupplyLine(false, this.get("supplyShiftCount") >= 2, 2);
    this.get("lines")[8] = firstSShift;
    this.get("lines")[9] = secondSShift;
  },

  recalculateSurpluses: function() {
    /* First surplus is CS */
    /* Second surplus is PS */
    this.get("surpluses")[0] = this.generateConsumerSurplus();
    this.get("surpluses")[1] = this.generateProducerSurplus();
  },

  generateConsumerSurplus: function() {
    var params = this.get("parameters");
    var d_a = this.get("d_a");
    var d_b = this.get("d_b");
    var d_c = this.get("d_c");
    var s_a = this.get("s_a");
    var s_b = this.get("s_b");
    var s_c = this.get("s_c");
    var p_s = this.get("p*");
    var q_s = this.get("q*");

    var cS = (d_a * Math.pow(q_s, 3)) / 3 - (d_b * Math.pow(q_s, 2))/2 + (d_c - p_s) * q_s;
    var position = {};
    position.x = q_s / 4;
    position.y = Math.min(p_s + 0.1 * params["maxYValue"], params["maxYValue"] * 0.95);
    var cSurplus = new Surplus({
     name: "CS",
     value: cS.toFixed(1),
     position: position
   });
    return cSurplus;
  },

  generateProducerSurplus: function() {
    var d_a = this.get("d_a");
    var d_b = this.get("d_b");
    var d_c = this.get("d_c");
    var s_a = this.get("s_a");
    var s_b = this.get("s_b");
    var s_c = this.get("s_c");
    var p_s = this.get("p*");
    var q_s = this.get("q*");
    var params = this.get("parameters");
    var s_slope_inv = 1 / params['s_slope_inv'];
    var s_int_inv = params['s_int_inv'] / params['s_slope_inv'];
    var s_vertex = params["s_vertex"];
    var s_0 = Math.max(((params["parabola"]) ? -s_int_inv/s_slope_inv : s_vertex), 0);

    var pS = (-s_a * Math.pow(q_s, 3) / 3) - (s_b * Math.pow(q_s, 2) / 2) - (s_c - p_s)*q_s + s_a*s_0 + s_b*s_0 + (s_c - p_s)*s_0 + p_s * s_0;

    var position = {};
        // Is it a triangle?
        position.x = q_s / 4;
        position.y = Math.max(p_s - 0.1 * params["maxYValue"], params["maxYValue"] * 0.05);


        var pSurplus = new Surplus({
         name: "PS",
         value: pS.toFixed(1),
         position: position
       });
        return pSurplus;
      },

      recalculateIntersections: function() {
        var intersectionLine = this.generateIntersectionLine();
        this.get("lines")[10] = intersectionLine;
      },

      generateIntersectionLine: function() {
        var pS = this.get("p*");
        var qS = this.get("q*");

        var int1 = new Line({
          points: [[qS, pS]],
          fillOn: false,
          fillAndStroke: false,
          showMarker: true,
          showLine: false,
          lineThickness: 4
        });
        return int1;
      },

      processTouch: function() {
        var activeLine = this.get("touchedLine");
        var activePoint = this.get("touchedPoint");
        var params = this.get("parameters");
        if (activeLine === 0 || activeLine == 4) {
            // Demand line is touched
            if (!params['parabola']) {
              var d_slope_inv = 1 / params['d_slope_inv'];
              var d_int_inv = activePoint.y + d_slope_inv * activePoint.x;
              params['d_int_inv'] = d_int_inv / d_slope_inv;

            }
            else {
              params["d_vertex"] = activePoint.x + Math.sqrt(activePoint.y / params["d_curve"]);
            }
            this.rebuildGraph(false);
          }
          else if (activeLine == 6) {
            if (!params['parabola']) {
              var d_slope_inv = 1 / params['d_slope_inv'];
              var d_int_inv = activePoint.y + d_slope_inv * activePoint.x;
              this.set("d_int_inv'", d_int_inv / d_slope_inv);
            }
            else {
              this.set("d_vertex'", activePoint.x + Math.sqrt(activePoint.y / params["d_curve"]));
            }
            this.rebuildGraph(false);
          }
          else if (activeLine == 7) {
            if (!params['parabola']) {
              var d_slope_inv = 1 / params['d_slope_inv'];
              var d_int_inv = activePoint.y + d_slope_inv * activePoint.x;
              this.set("d_int_inv''", d_int_inv / d_slope_inv);
            }
            else {
              this.set("d_vertex''", activePoint.x + Math.sqrt(activePoint.y / params["d_curve"]));
            }
            this.rebuildGraph(false);
          }
          else if (activeLine == 3) {
            // Supply line is touched
            if (!params['parabola']) {
              var s_slope_inv = 1 / this.get('parameters')['s_slope_inv'];
              var s_int_inv = activePoint.y - s_slope_inv * activePoint.x;
              this.get('parameters')['s_int_inv'] = s_int_inv / s_slope_inv;
            }
            else {
              params["s_vertex"] = -(- activePoint.x + Math.sqrt(activePoint.y / params["s_curve"]));
            }
            this.rebuildGraph(false);
          }
          else if (activeLine == 8) {
            if (!params['parabola']) {
              var s_slope_inv = 1 / params['s_slope_inv'];
              var s_int_inv = activePoint.y - s_slope_inv * activePoint.x;
              this.set("s_int_inv'", s_int_inv / s_slope_inv);
            }
            else {
              this.set("s_vertex'", -(-activePoint.x + Math.sqrt(activePoint.y / params["s_curve"])));
            }
            this.rebuildGraph(false);
          }
          else if (activeLine == 9) {
            if (!params['parabola']) {
              var s_slope_inv = 1 / params['s_slope_inv'];
              var s_int_inv = activePoint.y - s_slope_inv * activePoint.x;
              this.set("s_int_inv''", s_int_inv / s_slope_inv);
            }
            else {
              this.set("s_vertex''", -(-activePoint.x + Math.sqrt(activePoint.y / params["s_curve"])));
            }
            this.rebuildGraph(false);
          }
        },

        shiftLine: function(lineIndex) {
          var offset = params["maxYValue"] / 10;
          if (lineIndex === 0) {
            // shift demand
            var shifts = this.get("demandShiftCount");
            shifts = Math.min(shifts + 1, 2);
            this.set("demandShiftCount", shifts);
            this.rebuildGraph(true);
          }
          else if (lineIndex === 4) {
            var shifts = this.get("supplyShiftCount");
            shifts = Math.min(shifts + 1, 2);
            this.set("supplyShiftCount", shifts);
            this.rebuildGraph(true);
            // shift supply
          }
        },

        generateDemandLine: function(fill, show, shiftIndex) {
          var params = this.get('parameters');

          var xMin = params["minXValue"];
          var xMax;
          if (shiftIndex === 0) {
            xMax = (params["parabola"]) ? params["d_vertex"] : params["maxXValue"];
          }
          else {
            xMax = (params["parabola"]) ? this.get("d_vertex" + Array(shiftIndex + 1).join("'")) : params["maxXValue"];
          }
          var d_a = this.get("d_a");

          var d_b = this.get("d_b" + Array(shiftIndex + 1).join("'"));
          var d_c = this.get("d_c" + Array(shiftIndex + 1).join("'"));
          var points = [];
          var steps = 100;
          for (var i = 0; i <= steps; i++) {
            var x = xMin + i * (xMax - xMin) / steps;
            /*            var y = d_int_inv - d_slope_inv * x; */
            var y = d_a * Math.pow(x, 2) + d_b * x + d_c;
            points.push([x, y]);
          }
          return new Line({
            active: show,
            points: points,
            fillOn: this.get('parameters')["shade"] && fill,
            fillColor: "blue",
            lineLabel: "D" + Array(shiftIndex + 1).join("'"),
            showLineLabel: show,
            lineLabelYPosition: 0,
            lineLabelXPosition: "right"
          });
        },

        generateFullSupplyLine: function(fill, show, shiftIndex) {
         var params = this.get('parameters');
         var xMin;
         if (shiftIndex === 0) {
          xMin = (params["parabola"]) ? params["s_vertex"] : params["minXValue"];
        }
        else {
          xMin = (params["parabola"]) ? this.get("s_vertex" + Array(shiftIndex + 1).join("'")) : params["minXValue"];
        }
        var xMax = params["maxXValue"];
        var s_a = this.get("s_a");
        var s_b = this.get("s_b" + Array(shiftIndex + 1).join("'"));
        var s_c = this.get("s_c" + Array(shiftIndex + 1).join("'"));
        var points = [];
        var steps = 100;
        for (var i = 0; i <= steps; i++) {
          var x = xMin + i * (xMax - xMin) / steps;
          /*          var y = s_int_inv + s_slope_inv * x; */
          var y = s_a * Math.pow(x, 2) + s_b * x + s_c;
          points.push([x, y]);
        }
        return new Line({
          active: show,
          points: points,
          fillOn: this.get("parameters")['shade'] && fill,
          lineLabel: "S" + Array(shiftIndex + 1).join("'"),
          showLineLabel: show,
          lineLabelYPosition: 0,
          lineLabelXPosition: "right"
        });
      },

      generateCenterLines: function() {
        var pS = this.get("p*");
        var qS = this.get("q*");

        var pLine1 = new Line({
          points: [[0, pS], [qS, pS]],
          fillOn: this.get("parameters")['shade'],
          fillAndStroke: false,
          fillColor: "red",
          active: this.get("parameters")['shade']
        });

        var pLine2 = new Line({
          points: [[0, pS], [qS, pS]],
          fillOn: false,
          lineStyle: 1
        });
        var qLine = new Line({
          points: [[qS, 0], [qS, pS]],
          fillOn: false,
          lineStyle: 1
        });
        return [pLine1, pLine2, qLine];
      },

      updateLocalVariables: function() {
        var params = this.get('parameters');
        if (!params["parabola"]) {
          var s_slope_inv = 1 / params['s_slope_inv'];
          var d_slope_inv = 1 / params['d_slope_inv'];
          var s_int_inv = params['s_int_inv'] / params['s_slope_inv'];
          var s_int_inv2 = this.get("s_int_inv'") / params['s_slope_inv'];
          var s_int_inv3 = this.get("s_int_inv''") / params['s_slope_inv'];
          var d_int_inv = params['d_int_inv'] / params['d_slope_inv'];
          var d_int_inv2 = this.get("d_int_inv'") / params['d_slope_inv'];
          var d_int_inv3 = this.get("d_int_inv''") / params['d_slope_inv'];

          var qS = (-s_int_inv + d_int_inv) / (s_slope_inv + d_slope_inv)
          var pS = d_int_inv - d_slope_inv * qS;
          this.set("p*", pS);
          this.set("q*", qS);

          this.set("d_a", 0);
          this.set("d_b", -d_slope_inv);

          this.set("d_b'", -d_slope_inv);
          this.set("d_b''", -d_slope_inv);

          this.set("d_c", d_int_inv);

          this.set("d_c'", d_int_inv2);
          this.set("d_c''", d_int_inv3);

          this.set("s_a", 0);
          this.set("s_b", s_slope_inv);
          this.set("s_b'", s_slope_inv);
          this.set("s_b''", s_slope_inv);
          this.set("s_c", s_int_inv);
          this.set("s_c'", s_int_inv2);
          this.set("s_c''", s_int_inv3);

          var sVert = -s_int_inv / s_slope_inv;
          params["s_vertex"] = sVert;
          this.set("s_vertex'", -s_int_inv2 / s_slope_inv);
          this.set("s_vertex''", -s_int_inv3 / s_slope_inv);
          params["s_curve"] = pS / (Math.pow(qS - sVert, 2));

          var dVert = d_int_inv / d_slope_inv;

          params["d_vertex"] = dVert;
          this.set("d_vertex'", d_int_inv2 / d_slope_inv);
          this.set("d_vertex''", d_int_inv3 / d_slope_inv);
          params["d_curve"] = pS / Math.pow(qS - dVert, 2);
        } else {
          /* Parabola mode */
          var d_a = params["d_curve"];
          var d_b = -2 * params["d_curve"] * params["d_vertex"];
          var d_c = params["d_curve"] * Math.pow(params["d_vertex"], 2);

          var d_b_p = -2 * params["d_curve"] * this.get("d_vertex'");
          var d_c_p = params["d_curve"] * Math.pow(this.get("d_vertex'"), 2);

          var d_b_pp = -2 * params["d_curve"] * this.get("d_vertex''");
          var d_c_pp = params["d_curve"] * Math.pow(this.get("d_vertex''"), 2);

          var s_a = params["s_curve"];
          var s_b = -2 * params["s_curve"] * params["s_vertex"];
          var s_c = params["s_curve"] * Math.pow(params["s_vertex"], 2);

          var s_b_p = -2 * params["s_curve"] * this.get("s_vertex'");
          var s_c_p = params["s_curve"] * Math.pow(this.get("s_vertex'"), 2);

          var s_b_pp = -2 * params["s_curve"] * this.get("s_vertex''");
          var s_c_pp = params["s_curve"] * Math.pow(this.get("s_vertex''"), 2);

          var a = d_a - s_a;
          var b = d_b - s_b;
          var b_p = d_b_p - s_b;
          var b_pp = d_b_pp - s_b;
          var c = d_c - s_c;
          var c_p = d_c_p - s_c;
          var c_pp = d_c_pp - s_c;

          var qS;
            /*
            var qS_p;
            var qS_pp;
            */
            if (a === 0) {
              qS = -c/b;
                /*
                qS_p = -c/b_p;
                qS_pp = -c/b_pp;
                */
              }
              else {
                qS = (-b - Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a);
                /*
                qS_p = (-b_p - Math.sqrt(Math.pow(b_p, 2) - 4 * a * c_p)) / (2 * a);
                qS_pp = (-b_pp - Math.sqrt(Math.pow(b_pp, 2) - 4 * a * c_pp)) / (2 * a);
                */
              }
              var pS = d_a * Math.pow(qS, 2) + d_b * qS + d_c;
            /*
            var pS_p = d_a * Math.pow(qS_p, 2) + d_b_p * qS_p + d_c_pp;
            var pS_pp = d_a * Math.pow(qS_pp, 2) + d_b_pp * qS_p + d_c_pp;
            */

            this.set("p*", pS);
            this.set("q*", qS);

            this.set("d_a", d_a);
            this.set("d_b", d_b);
            this.set("d_b'", d_b_p);
            this.set("d_b''", d_b_pp);
            this.set("d_c", d_c);
            this.set("d_c'", d_c_p);
            this.set("d_c''", d_c_pp);
            this.set("s_a", s_a);
            this.set("s_b", s_b);
            this.set("s_b'", s_b_p);
            this.set("s_b''", s_b_pp);
            this.set("s_c", s_c);
            this.set("s_c'", s_c_p);
            this.set("s_c''", s_c_pp);

          }

          this.set("xAxisTicks", [params["minXValue"], [this.get("q*"), "Q* = " + this.get("q*").toFixed(1)], params["maxXValue"]]);
          this.set("yAxisTicks", [params["minYValue"], [this.get("p*"), "P* = " + this.get("p*").toFixed(1)], params["maxYValue"]]);
        }
      });
