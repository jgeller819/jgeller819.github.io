 var plot1;
 var options;
 var graph;

 replotGraph = function() {
  options = convertToOptionsHash(graph);
  plot1.replot(options);
  updateParametersFromGraph();
  plotSurpluses(plot1, graph);
  clearLineLabels();
  addLineLabels(plot1, graph);
};

updateParametersFromGraph = function() {
  var params = graph.get("parameters");
  var xNames = ["minXValue", "maxXValue"];
  var yNames = ["minYValue", "maxYValue", "d_int_inv", "d_slope_inv", "s_int_inv", "s_slope_inv"];
  for (var i = 0; i < yNames.length; i++) {
    $("input[name=" + yNames[i] + "]").val(roundedString(params[yNames[i]], params["maxYValue"]));
  }
  for (var i = 0; i < xNames.length; i++) {
    $("input[name=" + xNames[i] + "]").val(roundedString(params[xNames[i]], params["maxXValue"]));
  }
  var prodSurplus = graph.get("surpluses")[1];
  var conSurplus = graph.get("surpluses")[0];
  $("input[name=producer_surplus]").val(prodSurplus.get("value"));
  $("input[name=consumer_surplus]").val(conSurplus.get("value"));
  $("#pDSlider").slider("value", params["d_curve"] * 2000);
  $("#pSSlider").slider("value", params["s_curve"] * 2000);

  if (graph.get("demandShiftCount") >= 2) {
    $("button[name=shift_demand]").hide();
  } else {
    $("button[name=shift_demand]").show();
  }
  if (graph.get("supplyShiftCount") >= 2) {
    $("button[name=shift_supply]").hide();
  } else {
    $("button[name=shift_supply]").show();
  }
  if (graph.get("demandShiftCount") <= 0) {
    $("button[name=unshift_demand]").hide();
  } else {
    $("button[name=unshift_demand]").show();
  }
  if (graph.get("supplyShiftCount") <= 0) {
    $("button[name=unshift_supply]").hide();
  } else {
    $("button[name=unshift_supply]").show();
  }

};

updateGraphParameters = function() {
  var params = graph.get("parameters");
  var before_change = Number($(this).data('pre'));
  $(this).data('pre', $(this).val());
  var animationSteps = 30;
  var animatedNames = ["minXValue", "maxXValue", "minYValue", "maxYValue", "d_int_inv", "d_slope_inv", "s_int_inv", "s_slope_inv"];
  var unanimatedNames = [];
  var matchingLabel = {};
  var name = $(this).attr("name");

  var parabolaMode = $("input[name=parabolaRadio]:checked").val() === "on";
  graph.get("parameters")["parabola"] = parabolaMode;
  graph.get("parameters")["shade"] = $("input[name=shadeRadio]:checked").val() === "on";
  if (parabolaMode) {
    $(".linearEquation").hide();
    $(".quadraticEquation").show();
  }
  else {
    $(".linearEquation").show();
    $(".quadraticEquation").hide();
  }
  if (name === "shadeRadio" || name === "parabolaRadio")  {
    graph.rebuildGraph(true);
    return;
  }

  for (var i = 0; i < unanimatedNames.length; i++) {
    params[unanimatedNames[i]] = $("input[name=" + unanimatedNames[i] + "]").val();
    if (name === unanimatedNames[i]) {
      params[matchingLabel[name]] = $("input[name=" + unanimatedNames[i] + "]").val() + "=";
      graph.rebuildGraph(true);
      return;
    }
  }
  var changeParam = function(index) {
    params[name] = before_change + index*step;
    graph.rebuildGraph(true);
  };
  for (i = 0; i < animatedNames.length; i++) {
    if (animatedNames[i] != name) {
      continue;
    }
    var current = Number($("input[name=" + name + "]").val());
    var step = (current - before_change) / animationSteps;
    for (var j = 0; j < animationSteps; j++) {
      window.setTimeout(changeParam, 1, [j]);
    }
    window.setTimeout(function() {
      params[name] = current;
      graph.rebuildGraph(true);
    }, 1);
  }
};

changeDemandLineColor = function(color) {
  graph.get("parameters")["demand_color"] = color.toHexString();
  graph.rebuildGraph(true);
};

changeSupplyLineColor = function(color) {
  graph.get("parameters")["supply_color"] = color.toHexString();
  graph.rebuildGraph(true);
};

changeDemandFillColor = function(color) {
  graph.get("parameters")["demand_fill_color"] = color.toHexString();
  graph.rebuildGraph(true);
};

changeSupplyFillColor = function(color) {
  graph.get("parameters")["supply_fill_color"] = color.toHexString();
  graph.rebuildGraph(true);
};

$(document).ready(function(){
  $( "#pDSlider" ).slider({
    range: "max",
    min: 0,
    max: 20,
    value: 10,
    slide: function( event, ui ) {
      graph.get("parameters")["d_curve"] = ui.value / 2000;
      graph.rebuildGraph(true);
    }
  });

  $( "#pSSlider" ).slider({
    range: "max",
    min: 0,
    max: 20,
    value: 10,
    slide: function( event, ui ) {
      graph.get("parameters")["s_curve"] = ui.value / 2000;
      graph.rebuildGraph(true);
    }
  });

  $("#reset").click(function(e) {
    e.preventDefault();
    graph.reset();
  });

  $("#export").click(function(e) {
    e.preventDefault();
    html2canvas($("#containerView"), {
      onrendered: function(canvas) {
       window.open(canvas.toDataURL(), "graph.png");
      }
    });
  });


  $("button[name=shift_demand]").click(function(e) {
    e.preventDefault();
    graph.shiftLine(0);
  });

  $("button[name=shift_supply]").click(function(e) {
    e.preventDefault();
    graph.shiftLine(4);
  });

  $("button[name=unshift_demand]").click(function(e) {
    e.preventDefault();
    graph.removeShift(0);
  });

  $("button[name=unshift_supply]").click(function(e) {
    e.preventDefault();
    graph.removeShift(4);
  });

  $("input[name=demand_color]").spectrum({
    color: "#32315c",
    move: changeDemandLineColor,
    hide: changeDemandLineColor
  });

   $("input[name=supply_color]").spectrum({
    color: "#711d1f",
    move: changeSupplyLineColor,
    hide: changeSupplyLineColor
  });

    $("input[name=demand_fill_color]").spectrum({
    color: "#3c592e",
    move: changeDemandFillColor,
    hide: changeDemandFillColor
  });

     $("input[name=supply_fill_color]").spectrum({
    color: "#3671bf",
    move: changeSupplyFillColor,
    hide: changeSupplyFillColor
  });


  graph = new EquilibriumGraph();
  options = convertToOptionsHash(graph);
  plot1 = $.jqplot("chart1", options.data, options);
  plotSurpluses(plot1, graph);
  addLineLabels(plot1, graph);
  $(".param").each(function(i, el) {
    $(el).data("pre", $(el).val());
  });
  $(".param").change(updateGraphParameters);

  touchDown = function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    var touch = translateTouch(e);
    var touchedLine = detectTouch(graph, touch);
    if (touchedLine > -1) {
      graph.singleTouchBegan(touch, touchedLine);
      $("#chart1").on("mousemove", {plot: plot1, graph: graph}, touchMoved);
    }
  };

  $("#chart1").on('mousedown', {plot: plot1, graph: graph}, touchDown);

  $(document).on('mouseup', function() {
    $("#chart1").off('mousemove');
    graph.singleTouchEnded();
  });
});
