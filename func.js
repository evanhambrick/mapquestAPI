var URL="http://www.mapquestapi.com/directions/v2/route?key=jkRBDUbjSeVkUYFEU4fQbGrw8GxeA1af&from="
var elev_url="https://open.mapquestapi.com/elevation/v1/chart?key=jkRBDUbjSeVkUYFEU4fQbGrw8GxeA1af&shapeFormat=raw&width=400&height=300&latLngCollection="
var street1="";
var street2="";
var state1="";
var state2="";
var city1="";
var city2="";
var ps1="";
var ps2="";
var Obj = {};
var objJSON;
var strJSON;
var num = 0;
var cont;

function findRoute() {
	//First ajax call to the mapques api. Getting maneuver information
	a=$.ajax({
		url: "http://www.mapquestapi.com/directions/v2/route?key=jkRBDUbjSeVkUYFEU4fQbGrw8GxeA1af&from=" + $("#start").val() + "&to=" + $("#to").val(),
		method: "GET"
	}).done(function(data) {
		console.log(data);
		$("#test").html("");
		$("#map").html("");
		$("#pad").html("");
		latlng = "";
		//Checks to see if the ajax returned anything. Responds before ending the program if ajax is empty
		try {
		len = data.route.legs[0].maneuvers.length;
		} catch (err) {
			alert("Please enter valid addresses");
			$("#det").removeClass("touch_up");
			$("#pad").removeClass("bordered");
			$("#elev").html("");
			$("#end").html("");
			return;
		}
		$("#det").addClass("touch_up");
		for (i=0;i<len-1;i++) {
			$("#test").append("Distance: " + data.route.legs[0].maneuvers[i].distance + " miles<br>" + " Time: " + data.route.legs[0].maneuvers[i].time + " seconds<br>" + "Narrative: " + data.route.legs[0].maneuvers[i].narrative + "<br><br><br><br><br><br>");
			//$("#pad").append(" ");
			$("#map").append("<img src=" + data.route.legs[0].maneuvers[i].mapUrl + " alt='route'><br><br>");
			latlng += data.route.legs[0].maneuvers[i].startPoint.lat + "," + data.route.legs[0].maneuvers[i].startPoint.lng + ",";
		}
		latlng += data.route.legs[0].maneuvers[len-1].startPoint.lat + "," + data.route.legs[0].maneuvers[len-1].startPoint.lng;
		$("#elev").html("<h3>Elevation Chart</h3><br><img src=" + elev_url + latlng.toString() + " alt='elevation chart'><br><br>");
		$("#end").html(data.route.legs[0].maneuvers[len-1].narrative + "<br>Congratulations! You've arrived at your destination.");
		// Creates the JSON object to be sent to the PHP server
		Obj = {
			start : $("#start").val(),
			to : $("#to").val(),
			maneuvers : data.route.legs[0].maneuvers,
			elevation : elev_url + latlng.toString()
		};
		objJSON = JSON.stringify(Obj);
		// Second ajax call posting the JSON to the server
		b=$.ajax({
		url: "http://hambriem.aws.csi.miamioh.edu/final.php?method=setLookup",
		method: "POST",
		data: {"location" : "45056", "sensor" : "web", "value" : objJSON}
	}).done(function(data) {
		console.log(data);
	}).fail(function(error) {
		console.log("Error posting data");
	});

	}).fail(function(error) {
		$("#map").html("<p>No map data</p>");
	});
}

function getRoute() {
	//Ajax call to the php server to collect saved JSON information
	a=$.ajax({
		url: "http://hambriem.aws.csi.miamioh.edu/final.php?method=getLookup",
		method: "GET",
		data: {"date" : $("#date").val().toString()}
	}).done(function(data) {
		console.log(data);
		cont = data;
		// Checks if the user has put in valid information
		try {
		len = data.result.length;
		} catch (err) {
			alert("Please enter a valid date");
			return;
		}
		if (len == 0) {
			alert("No direction requests on this date.");
			return;
		}
		lines = $("#lines").val();
		if (lines < 1) {
			alert("There needs to at least be one line.")
			return;
		}
		$("#table").html("");
		$("#table").append("<thead><tr><th>Entry</th><th>Date and Time</th><th>Address and Maneuvers</th></tr></thead>");
		// Loops through the max # of lines the user input, while also keeping track of the total # of objects in the server
		for (i=0;(i < lines) && (num < len);i++, num++) {
			info = JSON.parse(data.result[num].value);
			$("#table").append("<tbody id='bod'><tr class='selectable'><td>" + (num + 1) + "</td><td>" + data.result[num].date + "</td><td>From: " + info.start + "<br> To: " + info.to + " <br> Manuevers: " + info.maneuvers.length + "</td></tr></tbody></table>");
		}

		if (num == len)
			num = 0;

		$("#buttons").html("<button type='button' onClick='getRoute()' id='next' class='button'>Next</button>");
		//Code to select table rows and display information about the JSON object
		$("#table tbody tr").click(function(){
			$("#mapRet").html("");
			$("#test2").html("");
			$(".selected").removeClass("selected");
			$(this).addClass("selected");
			$("#det2").addClass("touch_up");
			var sel = $(this).find('td:first').html();
			sel--;
			info = JSON.parse(data.result[sel].value);
			manlen = info.maneuvers.length;
			for (i=0;i<manlen-1;i++) {
		 		$("#test2").append("Distance: " + info.maneuvers[i].distance + " miles<br>" + " Time: " + info.maneuvers[i].time + " seconds<br>" + "Narrative: " + info.maneuvers[i].narrative + "<br><br><br><br><br><br>");
				$("#mapRet").append("<img src=" + info.maneuvers[i].mapUrl + " alt='route'><br><br>");
			}
	 		$("#elevRet").html("<h3>Elevation Chart</h3><br><img src=" + info.elevation + " alt='elevation chart'><br><br>");
	 		$("#end2").html(info.maneuvers[manlen-1].narrative + "<br>Congratulations! You've arrived at your destination.");
		});

	}).fail(function(error) {
		console.log("Error getting data");
	});
}
