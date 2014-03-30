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
  var names = ["minXValue", "maxXValue", "minYValue", "maxYValue", "d_int_inv", "d_slope_inv", "s_int_inv", "s_slope_inv"];
  for (var i = 0; i < names.length; i++) {
    $("input[name=" + names[i] + "]").val(params[names[i]]);
  }
  $("#pDSlider").slider("value", params["d_curve"] * 2000);
  $("#pSSlider").slider("value", params["s_curve"] * 2000);

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

/**
  $("#pDSlider").slider().on('slide', function(ev){
    graph.get("parameters")["d_curve"] = ev.value / 2000;
    graph.rebuildGraph();
  });
  $("#pSSlider").slider().on('slide', function(ev){
    graph.get("parameters")["s_curve"] = ev.value/ 2000;
    graph.rebuildGraph();
  });
*/

  $("button[name=demandShift]").click(function(e) {
    e.preventDefault();
    graph.shiftLine(0);
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
