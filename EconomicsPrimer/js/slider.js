/*Slider*/

  $(function() {
    $( "#slider" ).slider();
  });

  $(function() {
    $( "#slider-range-max" ).slider({
      range: "max",
      min: 1,
      max: 100,
      value: 2,
      slide: function( event, ui ) {
        $( "#amount" ).val( ui.value );
      }
    });
    $( "#amount" ).val( $( "#slider-range-max" ).slider( "value" ) );
  });




  $(function() {
    $( "#slider-range" ).slider({
      range: true,
      min: 0,
      max: 500,
      slide: function( event, ui ) {
        $( "#amount" ).val( "" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
      }
    });
    $( "#amount" )
  });
 