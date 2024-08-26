// Declare csvData globally at the top
var csvData;

window.addEventListener('load', function() {
    openPopup();
});

//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

    //pseudo-global variables
    var attrArray = ["dem_1996", "rep_1996", "oth_1996", "tot_1996", "pct_1996", "dem_2000", "rep_2000", "oth_2000", "tot_2000", "pct_2000", "dem_2004", "rep_2004", "oth_2004", "tot_2004", "pct_2004", "dem_2008", "rep_2008", "oth_2008", "tot_2008", "pct_2008", "dem_2012", "rep_2012", "oth_2012", "tot_2012", "pct_2012", "dem_2016", "rep_2016", "oth_2016", "tot_2016", "pct_2016", "dem_2020", "rep_2020", "oth_2020", "tot_2020", "pct_2020"]; //list of attributes
    var expressed = attrArray[9]; //initial attribute
    
    //begin script when window loads
    window.addEventListener('load', function() {
        setMap();
    });
    

    // This function creates and appends the SVG legend
    function createLegend(mapWidth, mapHeight) {

        // Define dimensions for the legend
        var legendWidth = 250;
        var legendHeight = 360;

        // Position the legend in the lower right corner
        var legendX = mapWidth - legendWidth - 10;  // 10 pixels padding from the right
        var legendY = mapHeight - legendHeight - 10;  // 10 pixels padding from the bottom

        // Select the .svgtest div and append an SVG element to it
        var svg = d3.select(".map").append("svg")
            .attr("id", "legend")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .attr("x", legendX)
            .attr("y", legendY);


        // Add the defs and linear gradients
        var defs = svg.append("defs");

        defs.append("linearGradient")
            .attr("id", "linear-gradient")
            .attr("x1", "25.42")
            .attr("y1", "36.63")
            .attr("x2", "225.58")
            .attr("y2", "36.63")
            .attr("gradientUnits", "userSpaceOnUse")
            .selectAll("stop")
            .data([
                { offset: "0%", color: "#4350a2" },
                { offset: "100%", color: "#4350a2", opacity: "0" }
            ])
            .enter()
            .append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color)
            .attr("stop-opacity", d => d.opacity || 1);

        defs.append("linearGradient")
            .attr("id", "linear-gradient-2")
            .attr("x1", "25.42")
            .attr("y1", "96.63")
            .attr("x2", "225.58")
            .attr("y2", "96.63")
            .attr("gradientUnits", "userSpaceOnUse")
            .selectAll("stop")
            .data([
                { offset: "0%", color: "#f04923", opacity: "0" },
                { offset: "100%", color: "#f04923" }
            ])
            .enter()
            .append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color)
            .attr("stop-opacity", d => d.opacity || 1);

        // Add rectangles and text elements
        svg.append("rect")
            .attr("class", "cls-8")
            .attr("x", ".5")
            .attr("y", ".5")
            .attr("width", "250")
            .attr("height", "360");

        svg.append("rect")
            .attr("class", "cls-9")
            .attr("x", "20.76")
            .attr("y", "161.63")
            .attr("width", "60")
            .attr("height", "30");

        svg.append("rect")
            .attr("class", "cls-7")
            .attr("x", "20.76")
            .attr("y", "211.63")
            .attr("width", "60")
            .attr("height", "30");

        svg.append("rect")
            .attr("class", "cls-11")
            .attr("x", "20.76")
            .attr("y", "261.4")
            .attr("width", "60")
            .attr("height", "30");

        svg.append("rect")
            .attr("class", "cls-10")
            .attr("x", "20.76")
            .attr("y", "311.4")
            .attr("width", "60")
            .attr("height", "30");

        svg.append("text")
            .attr("class", "cls-16")
            .attr("transform", "translate(97.27 180.15)")
            .text("75% - 100% for Democrat");

        svg.append("text")
            .attr("class", "cls-16")
            .attr("transform", "translate(97.27 230.15)")
            .text("50% - 75% for Democrat");

        svg.append("text")
            .attr("class", "cls-16")
            .attr("transform", "translate(97.27 280.38)")
            .text("50% - 75% for Republican");

        svg.append("text")
            .attr("class", "cls-16")
            .attr("transform", "translate(97.27 330.38)")
            .text("75% - 100% for Republican");

        svg.append("rect")
            .attr("class", "cls-20")
            .attr("x", "25.42")
            .attr("y", "21.63")
            .attr("width", "200.16")
            .attr("height", "30")
            .attr("rx", "14.72")
            .attr("ry", "14.72");

        svg.append("text")
            .attr("class", "cls-16")
            .attr("transform", "translate(69.43 66.32)")
            .text("Democratic-ward Shift");

        svg.append("rect")
            .attr("class", "cls-3")
            .attr("x", "25.42")
            .attr("y", "81.63")
            .attr("width", "200.16")
            .attr("height", "30")
            .attr("rx", "14.72")
            .attr("ry", "14.72");

        svg.append("text")
            .attr("class", "cls-16")
            .attr("transform", "translate(70.23 126.32)")
            .text("Republican-ward Shift");
    }


    //set up choropleth map
    function setMap() {
        
        //map frame dimensions
        var width = window.innerWidth * 0.95,
            height = window.innerHeight * 0.95 - 100;
    
        //create container div for the map and chart
        var container = d3.select("body")
            .append("div")
            .attr("class", "svg-container");
        
        //create new svg container for the map
        var map = container.append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height)
            .call(d3.zoom() // Add zoom behavior
                .scaleExtent([1, 8]) // Define the minimum and maximum zoom scale
                .on("zoom", zoomed)); // On zoom, call the zoomed function
        
        d3.select("body")
            .append("div")
            .attr("class", "svgtest")
            .style("position", "absolute")
            .style("right", "10px")
            .style("bottom", "10px");


        // Create a group to hold all map elements (paths, etc.)
        var g = map.append("g");

        //create Albers equal area conic projection centered on Virginia
        var projection = d3.geoAlbers()
            .center([0, 37.525])
            .rotate([77.5, 0, 0])
            .parallels([36, 39])
            .scale(200000)
            .translate([width / 2, height / 2]);
    
        var path = d3.geoPath()
            .projection(projection);
    
        //use Promise.all to parallelize asynchronous data loading
        var promises = [];    
        promises.push(d3.csv("data/precinctData.csv")); //load attributes from csv    
        promises.push(d3.json("data/VirginiaMunicipalities.topojson")); //load background spatial data    
        promises.push(d3.json("data/RichmondPrecincts.topojson")); //load choropleth spatial data    
        Promise.all(promises).then(callback);
    
        function callback(data) {
            csvData = data[0];
            var virginia = data[1];
            var richmond = data[2];
            //console.log(csvData);
            //console.log(virginia);
            //console.log(richmond);
    
            //translate Virginia and Richmond TopoJSON
            var virginiaMunicipalities = topojson.feature(virginia, virginia.objects.VirginiaMunicipalities),
                richmondPrecincts = topojson.feature(richmond, richmond.objects.RichmondPrecincts).features;
    
            //examine the results
            //console.log(virginiaMunicipalities);
            //console.log(richmondPrecincts);
    
            //add VA municipalities to map
            var municipalities = g.append("path")
                .datum(virginiaMunicipalities)
                .attr("class", "municipalities")
                .attr("d", path);
    
            //join csv data to GeoJSON enumeration units
            richmondPrecincts = joinData(richmondPrecincts, csvData);
    
            //create the color scale
            var colorScale = makeColorScale(csvData);
    
            //add enumeration units to the map
            setEnumerationUnits(richmondPrecincts, g, path, colorScale);

            var demcolumn1 = "dem_1996";  // Replace with the first column you want to compare
            var repcolumn1 = "rep_1996";  // Replace with the second column you want to compare
            var totalcolumn1 = "tot_1996";
            var demcolumn2 = "dem_2000";
            var repcolumn2 = "rep_2000";
            var totalcolumn2 = "tot_2000"

            var redColors = [ 'rgb(255,0,0,0)', 'rgb(255,0,0,1)' ];

            var gradRed = g.append('defs')
                .append('linearGradient')
                .attr('id', 'gradRed')
                .attr('x1', '0%')
                .attr('x2', '100%')
                .attr('y1', '0%')
                .attr('y2', '0%');

            gradRed.selectAll('stop')
                .data(redColors)
                .enter()
                .append('stop')
                .style('stop-color', function(d){ return d; })
                .attr('offset', function(d,i){
                    return 100 * (i / (redColors.length - 1)) + '%';
                })

            var redColors = [ 'rgb(249,70,4,0)', 'rgb(249,70,4,1)' ];

            var gradRed = g.append('defs')
                .append('linearGradient')
                .attr('id', 'gradRed')
                .attr('x1', '0%')
                .attr('x2', '100%')
                .attr('y1', '0%')
                .attr('y2', '0%');

            gradRed.selectAll('stop')
                .data(redColors)
                .enter()
                .append('stop')
                .style('stop-color', function(d){ return d; })
                .attr('offset', function(d,i){
                    return 100 * (i / (redColors.length - 1)) + '%';
                })

            var blueColors = [ 'rgb(44,44,222,1)', 'rgb(44,44,222,0)' ];

                var gradBlue = g.append('defs')
                    .append('linearGradient')
                    .attr('id', 'gradBlue')
                    .attr('x1', '0%')
                    .attr('x2', '100%')
                    .attr('y1', '0%')
                    .attr('y2', '0%');
    
                gradBlue.selectAll('stop')
                    .data(blueColors)
                    .enter()
                    .append('stop')
                    .style('stop-color', function(d){ return d; })
                    .attr('offset', function(d,i){
                        return 100 * (i / (blueColors.length - 1)) + '%';
                    })

            // add rectangles for each precinct using latitude and longitude
            g.selectAll(".precinct-rect")
                .data(richmondPrecincts)
                .enter()
                .append("rect")
                .attr("class", "precinct-rect")
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("x", function(d) {
                    var xcenter = path.centroid(d)[0] - (Math.abs(((d.properties[demcolumn2]/d.properties[totalcolumn2]) - (d.properties[repcolumn2]/d.properties[totalcolumn2]))-((d.properties[demcolumn1]/d.properties[totalcolumn1]) - (d.properties[repcolumn1]/d.properties[totalcolumn1])))*200/2)
                    //return path.centroid(d)[0];
                    return xcenter;
                })
                .attr("y", function(d) {
                    return path.centroid(d)[1] - 5;
                })
                .attr("height", 10)
                .attr("width", function(d) {
                    var widthcalc = Math.abs(((d.properties[demcolumn2]/d.properties[totalcolumn2]) - (d.properties[repcolumn2]/d.properties[totalcolumn2]))-((d.properties[demcolumn1]/d.properties[totalcolumn1]) - (d.properties[repcolumn1]/d.properties[totalcolumn1])))*200;
                    //console.log(widthcalc);
                    return widthcalc;
                })
                .style("fill", function(d) {
                    var difference = (((d.properties[demcolumn2]/d.properties[totalcolumn2]) - (d.properties[repcolumn2]/d.properties[totalcolumn2]))-((d.properties[demcolumn1]/d.properties[totalcolumn1]) - (d.properties[repcolumn1]/d.properties[totalcolumn1])))*100;
                    //console.log(difference); 
                    return difference > 0 ? "url(#gradBlue)" : "url(#gradRed) ";
                })


                function setTitle(){
                    // Title content
                    var titleAttribute = "Vote change from 1996 to 2000";
                    var subtitleAttribute = "(Basemap colors: winner by precinct in 2000)";
                
                    // Calculate the right position for the title box
                    var titleBoxWidth = 400;  // Fixed width for the title box
                    var titleBoxHeight = 60;
                    var titleX = width - 40 - titleBoxWidth;  // Position the box 10 pixels from the right edge
                    var titleY = 90;  // Some padding from the top
                
                    // Create the title box
                    map.append("rect")
                        .attr("x", titleX)
                        .attr("y", titleY - titleBoxHeight / 2)
                        .attr("width", titleBoxWidth)
                        .attr("height", titleBoxHeight)
                        .attr("rx", 5)
                        .attr("class", "titleBox");
                
                    // Text element for the map title, centered within the box
                    var mapTitle = map.append("text")
                        .attr("class", "mapTitle")
                        .attr("x", titleX + titleBoxWidth / 2)  // Center the text within the box
                        .attr("y", titleY - 10)  // Adjust vertical alignment
                        .attr("dy", "0.35em")  // Vertically center the text
                        .attr("text-anchor", "middle")  // Center the text horizontally
                        .text(titleAttribute);

                    // Text element for the map subtitle, centered within the box
                    var mapSubtitle = map.append("text")
                        .attr("class", "mapSubtitle")
                        .attr("x", titleX + titleBoxWidth / 2)  // Center the text within the box
                        .attr("y", titleY + 15)  // Adjust vertical alignment
                        .attr("dy", "0.35em")  // Vertically center the text
                        .attr("text-anchor", "middle")  // Center the text horizontally
                        .text(subtitleAttribute);
                }
            
            setTitle();

            createLegend(width,height);
            
        };

        // Function to handle zoom events
        function zoomed(event) {
            g.attr("transform", event.transform); // Apply the transformation to the group
    }
    
    // Function to update the map based on selected years
    function updateMap() {
        // Get selected years from the dropdown menus
        var menu1value = document.getElementById("dropdown1").value;
        var menu2value = document.getElementById("dropdown2").value;

        // Define the columns based on the selected years
        var demcolumn1 = "dem_" + menu1value;
        var repcolumn1 = "rep_" + menu1value;
        var totalcolumn1 = "tot_" + menu1value;
        var demcolumn2 = "dem_" + menu2value;
        var repcolumn2 = "rep_" + menu2value;
        var totalcolumn2 = "tot_" + menu2value;
        var pctcolumn2 = "pct_" + menu2value;

        // Update the rectangles with new calculations
        g.selectAll(".precinct-rect")
            .transition().duration(500).ease(d3.easeLinear).style("opacity", 1)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("x", function(d) {
                var xcenter = path.centroid(d)[0] - (Math.abs(((d.properties[demcolumn2] / d.properties[totalcolumn2]) - (d.properties[repcolumn2] / d.properties[totalcolumn2])) - ((d.properties[demcolumn1] / d.properties[totalcolumn1]) - (d.properties[repcolumn1] / d.properties[totalcolumn1]))) * 200 / 2);
                return xcenter;
            })
            .attr("width", function(d) {
                var widthcalc = Math.abs(((d.properties[demcolumn2] / d.properties[totalcolumn2]) - (d.properties[repcolumn2] / d.properties[totalcolumn2])) - ((d.properties[demcolumn1] / d.properties[totalcolumn1]) - (d.properties[repcolumn1] / d.properties[totalcolumn1]))) * 200;
                return widthcalc;
            })
            
            .style("fill", function(d) {
                var difference = (((d.properties[demcolumn2] / d.properties[totalcolumn2]) - (d.properties[repcolumn2] / d.properties[totalcolumn2])) - ((d.properties[demcolumn1] / d.properties[totalcolumn1]) - (d.properties[repcolumn1] / d.properties[totalcolumn1]))) * 100;
                d.properties.difference = difference; // Store difference in properties for later use
                return difference > 0 ? "url(#gradBlue)" : "url(#gradRed)";
            });

        function updateTitle(){

            // Remove the old title and box
            map.selectAll(".titleBox").remove();
            map.selectAll(".mapTitle").remove();
            map.selectAll(".mapSubtitle").remove();

            // Title content
            var titleAttribute = "Vote change from " + menu1value + " to " + menu2value;
            var subtitleAttribute = "(Basemap: precinct winner in " + menu2value +")";

            // Calculate the right position for the title box
            var titleBoxWidth = 400;  // Fixed width for the title box
            var titleBoxHeight = 60;
            var titleX = width - 40 - titleBoxWidth;  // Position the box 10 pixels from the right edge
            var titleY = 90;  // Some padding from the top
        
            // Create the title box
            map.append("rect")
                .attr("x", titleX)
                .attr("y", titleY - titleBoxHeight / 2)
                .attr("width", titleBoxWidth)
                .attr("height", titleBoxHeight)
                .attr("rx", 5)
                .attr("class", "titleBox");
        
            // Create a text element for the map title, centered within the box
            var mapTitle = map.append("text")
                .attr("class", "mapTitle")
                .attr("x", titleX + titleBoxWidth / 2)  // Center the text within the box
                .attr("y", titleY - 10)  // Adjust vertical alignment
                .attr("dy", "0.35em")  // Vertically center the text
                .attr("text-anchor", "middle")  // Center the text horizontally
                .text(titleAttribute);

            // Text element for the map subtitle, centered within the box
            var mapSubtitle = map.append("text")
                .attr("class", "mapSubtitle")
                .attr("x", titleX + titleBoxWidth / 2)  // Center the text within the box
                .attr("y", titleY + 15)  // Adjust vertical alignment
                .attr("dy", "0.35em")  // Vertically center the text
                .attr("text-anchor", "middle")  // Center the text horizontally
                .text(subtitleAttribute);
        }

        updateTitle();
        
        
        
        

        

        // Call changeAttribute with pctcolumn2
        changeAttribute(pctcolumn2, csvData);
    }

    // Attach the update function to the button click event
    document.getElementById("updateButton").addEventListener("click", updateMap);


    }; //end of setMap()

    

    function joinData(richmondPrecincts, csvData){
    
        //loop through csv to assign each set of csv attribute values to geojson municipality
        for (var i=0; i<csvData.length; i++){
            var csvPrecinct = csvData[i]; //the current region
            var csvKey = csvPrecinct.precinct; //the CSV primary key
    
            //loop through geojson regions to find correct municipality
            for (var a=0; a<richmondPrecincts.length; a++){
    
                var geojsonProps = richmondPrecincts[a].properties; //the current municipality geojson properties
                var geojsonKey = geojsonProps.precinct; //the geojson primary key
    
                //where primary keys match, transfer csv data to geojson properties object
                if (geojsonKey == csvKey){
    
                    //assign all attributes and values
                    attrArray.forEach(function(attr){
                        var val = parseFloat(csvPrecinct[attr]); //get csv attribute value
                        geojsonProps[attr] = val; //assign attribute and value to geojson properties
                    });
                    //console.log(geojsonProps)
                };
                
            };
        };
        
        return richmondPrecincts;
        
    };
    
    function setEnumerationUnits(richmondPrecincts, g, path,colorScale) {
    
        //add Richmond precincts to map
        var precincts = g.selectAll(".precincts")
            .data(richmondPrecincts)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "precincts " + d.properties.precinct;
            })
            .attr("d", path)
            .style("fill", function(d){            
                var value = d.properties[expressed];            
                if(value) {                
                    return colorScale(value);            
                } else {                
                    return "#ccc";            
                }
            })
            // Attach event listeners to the path elements
            .on("mouseover", function(event, d){
                highlight(d.properties);
            })
            .on("mouseout", function(event, d){
                dehighlight(d.properties);
            })
            .on("mousemove", moveLabel);
        
        //create precinct labels
        var precinctlabels = g.selectAll(".precinctlabels")
            .data(richmondPrecincts)
            .enter()
            .append("text")
            .attr("class", "precinctlabels")
            .attr("text-anchor", "middle")
            .attr("x", function(d) {
                return path.centroid(d)[0];
            })
            .attr("y", function(d) {
                return path.centroid(d)[1] - 9;
            })
            .text(function(d){
                return d.properties.ID;
            });


        var desc = precincts.append("desc")
            .text('{"stroke": "#fff", "stroke-width": "0.5px"}');
    };
    
    //function to create color scale generator
    function makeColorScale(data){
        var colorClasses = [
            "#fa8e66",
            "#ffd8cb",
            "#bdd7e7",
            "#6baed6"
        ];
    
        //create color scale generator
        var colorScale = d3.scaleQuantile()
            .range(colorClasses);
    
        //build two-value array of minimum and maximum expressed attribute values
        var minmax = [0, 1];
        //assign two-value array as scale domain
        colorScale.domain(minmax);

        return colorScale;
    };
    
    // change event handler
    function changeAttribute(attribute, csvData) {
        //change the expressed attribute
        expressed = attribute;

        //recreate the color scale
        var colorScale = makeColorScale(csvData);

        //recolor enumeration units
        var precincts = d3.selectAll(".precincts")
            .transition()
            .duration(1000)
            .style("fill", function (d) {
                var value = d.properties[expressed];
                if (value) {
                    return colorScale(value);
                } else {
                    return "#ccc";
                }
            });

    };
    
    //function to highlight enumeration units and bars
    function highlight(props){
        //change stroke
        var selected = d3.selectAll("." + props.precinct)
            .style("stroke", "white")
            .style("stroke-width", "2");
        setLabel(props, props.difference);
};

//function to reset the element style on mouseout
function dehighlight(props){
    var selected = d3.selectAll("." + props.precinct)
        .style("stroke", function(){
            return getStyle(this, "stroke")
        })
        .style("stroke-width", function(){
            return getStyle(this, "stroke-width")
        });

    function getStyle(element, styleName){
        var styleText = d3.select(element)
            .select("desc")
            .text();

        var styleObject = JSON.parse(styleText);

        return styleObject[styleName];
    };
    d3.select(".infolabel")
        .remove();
};



//function to create dynamic label
function setLabel(props, difference){
    //label content
    var labelAttribute = "Dems: " + Math.round(((props[expressed]*100) + Number.EPSILON) * 100) / 100 + "&#37;<br>Reps: " + Math.round((((1 - props[expressed])*100) + Number.EPSILON) * 100) / 100 +
        "&#37;<br>";

    //create info label div
    var infolabel = d3.select("body")
        .append("div")
        .attr("class", "infolabel")
        .attr("id", props.precinct + "_label")
        .html(labelAttribute);

    var precinctName = infolabel.append("div")
        .attr("class", "labelname")
        .html("Precinct: " + props.ID + "<br>Amount of shift: " + Math.abs(Math.round(difference * 100) / 100) + " percentage points");
};

//function to move info label with mouse
function moveLabel(){
    //get width of label
    var labelWidth = d3.select(".infolabel")
        .node()
        .getBoundingClientRect()
        .width;

    //use coordinates of mousemove event to set label coordinates
    var x1 = event.clientX + 10,
        y1 = event.clientY - 75,
        x2 = event.clientX - labelWidth - 10,
        y2 = event.clientY + 25;

    //horizontal label coordinate, testing for overflow
    var x = event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1; 
    //vertical label coordinate, testing for overflow
    var y = event.clientY < 75 ? y2 : y1; 

    d3.select(".infolabel")
        .style("left", x + "px")
        .style("top", y + "px");
};

})(); //last line of main.js