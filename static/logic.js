var ge;
var map;
var oms;
var instances = [];
var regionPlaceMarks = [];
var cloudFrontPlaceMarks = [];
var regionMarkers = [];
var cloudFrontMarkers = [];

var regionAbbrevs = ["ap-northeast-1", "ap-southeast-1", "ap-southeast-2", "eu-west-1", "sa-east-1", "us-east-1", "us-west-1", "us-west-2"];
var regionLocations = {
    "ap-northeast-1": {"longitude": 139.6917, "latitude": 35.6895},
    "ap-southeast-1": {"longitude": 103.8000, "latitude": 1.3000},
    "ap-southeast-2": {"longitude": 151.2111, "latitude": -33.8600},
    "eu-west-1": {"longitude": -6.2597, "latitude": 53.3478},
    "sa-east-1": {"longitude": -46.6333, "latitude": -23.5500},
    "us-east-1": {"longitude": -77.4667, "latitude": 37.5333},
    "us-west-1": {"longitude": -121.4689, "latitude": 38.5556},
    "us-west-2": {"longitude": -122.6819, "latitude": 45.5200},
};

var regionNames = {
    "ap-northeast-1": "Asia Pacific (Tokyo)",
    "ap-southeast-1": "Asia Pacific (Singapore)",
    "ap-southeast-2": "Asia Pacific (Sydney)",
    "eu-west-1": "EU (Ireland)",
    "sa-east-1": "South America (Sao Paulo)",
    "us-east-1": "US East (North Virginia)",
    "us-west-1": "US West (Northern California)",
    "us-west-2": "US West (Oregon)"
};

var cloudFrontNames = ["Atlanta, GA", "Ashburn, VA", "Dallas/Fort Worth, TX", "Hayward, CA", "Jacksonville, FL", "Los Angeles, CA", "Miami, FL", "New York, NY", "Newark, NJ", "Palo Alto, CA", "San Jose, CA", "Seattle, WA", "South Bend, IN", "St. Louis, MO", "Amsterdam, The Netherlands", "Dublin, Ireland", "Frankfurt, Germany", "London, England", "Madrid, Spain", "Marseilles, France", "Milan, Italy", "Paris, France", "Stockholm, Sweden", "Warsaw, Poland", "Chennai, India", "Hong Kong, China", "Mumbai, India", "Manila, The Philippines", "Osaka, Japan", "Seoul, Korea", "Singapore", "Taipei, Taiwan", "Tokyo, Japan", "Sydney, Australia", "Sao Paulo, Brazil", "Rio de Janeiro, Brazil"];
var cloudFrontLocations = {
    "Atlanta, GA": {"longitude": -84.3900, "latitude": 33.7550},
    "Ashburn, VA": {"longitude": -77.4875, "latitude": 39.0436},
    "Dallas/Fort Worth, TX": {"longitude": -96.7967, "latitude": 32.7758},
    "Hayward, CA": {"longitude": -122.0808, "latitude": 37.6689},
    "Jacksonville, FL": {"longitude": -81.6614, "latitude": 30.3369},
    "Los Angeles, CA": {"longitude": -118.2500, "latitude": 34.0500},
    "Miami, FL": {"longitude": -80.2241, "latitude": 25.7877},
    "New York, NY": {"longitude": -74.0059, "latitude": 40.7127},
    "Newark, NJ": {"longitude": -74.1726, "latitude": 40.7242},
    "Palo Alto, CA": {"longitude": -122.1381, "latitude": 37.4292},
    "San Jose, CA": {"longitude": -121.9000, "latitude": 37.3333},
    "Seattle, WA": {"longitude": -122.3331, "latitude": 47.6097},
    "South Bend, IN": {"longitude": -86.2553, "latitude": 41.6725},
    "St. Louis, MO": {"longitude": -90.1978, "latitude": 38.6272},
    "Amsterdam, The Netherlands": {"longitude": 4.8922, "latitude": 52.3731},
    "Dublin, Ireland": {"longitude": -6.2597, "latitude": 53.3478},
    "Frankfurt, Germany": {"longitude": 8.6858, "latitude": 50.1117},
    "London, England": {"longitude": -0.1275, "latitude": 51.5072},
    "Madrid, Spain": {"longitude": -3.6833, "latitude": 40.4000},
    "Marseilles, France": {"longitude": 5.3700, "latitude": 43.2964},
    "Milan, Italy": {"longitude": 9.1833, "latitude": 45.4667},
    "Paris, France": {"longitude": 2.3508, "latitude": 48.8567},
    "Stockholm, Sweden": {"longitude": 18.0686, "latitude": 59.3294},
    "Warsaw, Poland": {"longitude": 21.0167, "latitude": 52.2333},
    "Chennai, India": {"longitude": 80.2700, "latitude": 13.0839},
    "Hong Kong, China": {"longitude": 114.1880, "latitude": 22.2670},
    "Mumbai, India": {"longitude": 72.8258, "latitude": 18.9750},
    "Manila, The Philippines": {"longitude": 120.9667, "latitude": 14.5833},
    "Osaka, Japan": {"longitude": 135.5022, "latitude": 34.6939},
    "Seoul, Korea": {"longitude": 126.9780, "latitude": 37.5665},
    "Singapore": {"longitude": 103.8000, "latitude": 1.3000},
    "Taipei, Taiwan": {"longitude": 121.0000, "latitude": 23.5000},
    "Tokyo, Japan": {"longitude": 139.6917, "latitude": 35.6895},
    "Sydney, Australia": {"longitude": 151.2111, "latitude": -33.8600},
    "Sao Paulo, Brazil": {"longitude": -46.6333, "latitude": -23.5500},
    "Rio de Janeiro, Brazil": {"longitude": -43.1964, "latitude": -22.9083}
};

function createMarkers() {
    var fullName;
    var abbrev;
    var loc;
    var pl;
    var point;
    var marker;

    /* Regions */
    for (var i = 0; i < regionNames.length; i++) {
        fullName = regionNames[i];
        abbrev = regionAbbrevs[i];
        loc = regionLocations[abbrev];
        /*
        pl = ge.createPlacemark("");
        pl.setName(fullName);

        point = ge.createPoint("");
        point.setLatitude(loc.latitude);
        point.setLongitude(loc.longitude);
        pl.setGeometry(point);
        regionPlaceMarks.push(pl);
*/
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(loc.latitude, loc.longitude),
            title: fullName
        });
//        regionMarkers.push(marker);
    //            ge.getFeatures().appendChild(pl);
    }

    /* CloudFront Locations */
    for (i = 0; i < cloudFrontNames.length; i++) {
        fullName = cloudFrontNames[i];
        loc = cloudFrontLocations[fullName];
        /*
        pl = ge.createPlacemark("");
        pl.setName(fullName);

        point = ge.createPoint("");
        point.setLatitude(loc.latitude);
        point.setLongitude(loc.longitude);
        pl.setGeometry(point);
        cloudFrontPlaceMarks.push(pl);
        ge.getFeatures().appendChild(pl);
*/
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(loc.latitude, loc.longitude),
            map: map,
            title: fullName
        });
        cloudFrontMarkers.push(marker);
    }
}

function createPlacemarks() {
    var fullName;
    var abbrev;
    var loc;
    var pl;
    var point;
    var marker;

    /* Regions */
    for (var i = 0; i < regionNames.length; i++) {
        fullName = regionNames[i];
        abbrev = regionAbbrevs[i];
        loc = regionLocations[abbrev];

        pl = ge.createPlacemark("");
        pl.setName(fullName);

        point = ge.createPoint("");
        point.setLatitude(loc.latitude);
        point.setLongitude(loc.longitude);
        pl.setGeometry(point);
//        regionPlaceMarks.push(pl);
    }

    /* CloudFront Locations */
    for (i = 0; i < cloudFrontNames.length; i++) {
        fullName = cloudFrontNames[i];
        loc = cloudFrontLocations[fullName];

        pl = ge.createPlacemark("");
        pl.setName(fullName);

        point = ge.createPoint("");
        point.setLatitude(loc.latitude);
        point.setLongitude(loc.longitude);
        pl.setGeometry(point);
        cloudFrontPlaceMarks.push(pl);
        ge.getFeatures().appendChild(pl);
    }
}

function initializeEarth() {
//    $("#earth").height($("#earth").width() * 0.75);
    google.earth.createInstance("earth", function(instance) {
        ge = instance;
        ge.getLayerRoot().enableLayerById(ge.LAYER_TERRAIN, false);
        ge.getLayerRoot().enableLayerById(ge.LAYER_BORDERS, true);

//        ge.getSun().setVisibility(true);
        ge.getOptions().setAtmosphereVisibility(true);
        ge.getOptions().setOverviewMapVisibility(true);
        ge.getNavigationControl().setVisibility(ge.VISIBILITY_SHOW);

        createPlacemarks();

        var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
        lookAt.setRange(lookAt.getRange() * 0.2);
        lookAt.setLatitude(37.5333);
        lookAt.setLongitude(-100);
        ge.getView().setAbstractView(lookAt);

        ge.getWindow().setVisibility(true);

        google.earth.addEventListener(ge.getView(), 'viewchangeend', function() {
            if (!$("#mapContainer").hasClass("active")) {
                var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
                var center = new google.maps.LatLng(lookAt.getLatitude(), lookAt.getLongitude());
                map.setCenter(center);
            }
        });

    }, function(errorCode) {

    });
}

function updateInstances() {
    // Remove the old markers and such
    for (var i = 0; i < regionPlaceMarks.length; i++) {
        ge.getFeatures().removeChild(regionPlaceMarks[i]);
    }
    for (i = 0; i < regionMarkers.length; i++) {
        regionMarkers[i].setMap(null);
    }

    regionMarkers = [];
    regionPlaceMarks = [];
    var fullName;
    var abbrev;
    var instance;
    var region;
    var loc;
    var pl;
    var point;
    var marker;
    var balloon;
    var contentString = "";

    /* Regions */
    for (i = 0; i < instances.length; i++) {
        instance = instances[i];
        region = instance.region;
        fullName = regionNames[region];
        contentString =
            [
                "Region: " + region,
                "Location: " + fullName,
                "Launched: " + instance.launch_time,
                "SSH Key: " + instance.key_name,
                "Type: " + instance.instance_type,
                "IP Address: " + instance.ip_address
            ].join("\n");
//        var access = "AKIAIUTHP2WO6EGYYYLQ";
//        var secret = "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";

        loc = regionLocations[region];

        pl = ge.createPlacemark("");
//        pl.setName(fullName);
        pl.setName(fullName);

        point = ge.createPoint("");
        point.setLatitude(loc.latitude);
        point.setLongitude(loc.longitude);
        pl.setGeometry(point);

        pl.setDescription(contentString);

        regionPlaceMarks.push(pl);
        ge.getFeatures().appendChild(pl);

        loc = regionLocations[region];
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(loc.latitude, loc.longitude),
            title: contentString
        });
        regionMarkers.push(marker);
        marker.setMap(map);
        oms.addMarker(marker);
    }
}

google.load("earth", "1", {"other_params": "sensor=false"});
google.setOnLoadCallback(initializeEarth);

function initializeMap() {
    var mapOptions = {
        center: new google.maps.LatLng(37.5333, -100),
        zoom: 3,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    oms = new OverlappingMarkerSpiderfier(map);

    map.addListener("center_changed", function() {
        if ($("#mapContainer").hasClass("active")) {
            var mapCenter = map.getCenter();
            var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
            lookAt.setLatitude(mapCenter.lat());
            lookAt.setLongitude(mapCenter.lng());
            ge.getView().setAbstractView(lookAt);
        }
    });

    google.maps.event.addDomListener(window, "resize", function() {
     var center = map.getCenter();
     google.maps.event.trigger(map, "resize");
     map.setCenter(center);
    });
}

$(document).ready(function() {
    var ec2;

    initializeMap();
    createMarkers();

    $("#submit").click(function() {
        var baseURL = "http://pacific-island-5943.herokuapp.com/";
        var access = $("#ak").val();
        var secret = $("#sak").val();
//        var access = "AKIAIUTHP2WO6EGYYYLQ";
//        var secret = "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";

    //        AWS.config.update({accessKeyId: $("#ak").val(), secretAccessKey: $("#sak").val()});

        fullURL = baseURL + "instances?accessKey=" + encodeURIComponent(access) + "&secretKey=" + encodeURIComponent(secret);
        $("body").addClass("loading");
        $.jsonp({
            url: fullURL,
            callbackParameter: "callback",
            success: function(data) {
                if (!$(".validation").hasClass("has-success")) {
                    $(".validation").addClass("has-success");
                    $(".validation").removeClass("has-error");
                }
                var results = data.results;
                instances = [];
                for (var j = 0; j < results.length; j++) {
                    var instance = results[j];
                    instances.push(instance);
                }
                updateInstances();
                $("body").removeClass("loading");
            },
            error: function(err) {
                $(".validation").removeClass("has-success");
                $(".validation").addClass("has-error");
                instances = [];
                updateInstances();
                $("body").removeClass("loading");
            }
        });
    });

    $("#carousel").on("slid.bs.carousel", function() {
        if ($("#mapContainer").hasClass("active")) {
           var center = map.getCenter();
           google.maps.event.trigger(map, "resize");
           map.setCenter(center);
        }
    });

    $("input[name=toShow]:radio").change(function() {
        var ec2Selected = ($("input[name=toShow]:checked").attr("id") === "toShow1");
        if (ec2Selected) {
//            $("#title").text("Your AWS EC2 Instances");
            $(".ec2").show("slow");
            $(".cloudfront").hide("slow");
            // EC2
            for (var i = 0; i < cloudFrontPlaceMarks.length; i++) {
                ge.getFeatures().removeChild(cloudFrontPlaceMarks[i]);
            }
            for (i = 0; i < regionPlaceMarks.length; i++) {
                ge.getFeatures().appendChild(regionPlaceMarks[i]);
            }
            for (var i = 0; i < cloudFrontMarkers.length; i++) {
                cloudFrontMarkers[i].setMap(null);
                oms.removeMarker(cloudFrontMarkers[i]);
            }
            for (i = 0; i < regionMarkers.length; i++) {
                regionMarkers[i].setMap(map);
                oms.addMarker(regionMarkers[i]);
            }
        }
        else {
            $(".ec2").hide('slow');
            $(".cloudfront").show("slow");
//            $("#title").text("AWS CloudFront Locations");
//            $("#credentials").hide("slow");

            // CloudFront
            for (var i = 0; i < regionPlaceMarks.length; i++) {
                ge.getFeatures().removeChild(regionPlaceMarks[i]);
            }
            for (i = 0; i < cloudFrontPlaceMarks.length; i++) {
                ge.getFeatures().appendChild(cloudFrontPlaceMarks[i]);
            }
            for (var i = 0; i < cloudFrontMarkers.length; i++) {
                cloudFrontMarkers[i].setMap(map);
                oms.addMarker(cloudFrontMarkers[i]);
            }
            for (i = 0; i < regionMarkers.length; i++) {
                regionMarkers[i].setMap(null);
                oms.removeMarker(regionMarkers[i]);
            }
        }
    });
});
