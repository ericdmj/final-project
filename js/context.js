//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

    window.addEventListener('load', function() {
        openPopup();
    });

    //pseudo-global variables
    var attrArray = ["dem_1996", "rep_1996", "oth_1996", "tot_1996", "dem_2000", "rep_2000", "oth_2000", "tot_2000", "dem_2004", "rep_2004", "oth_2004", "tot_2004", "dem_2008", "rep_2008", "oth_2008", "tot_2008", "dem_2012", "rep_2012", "oth_2012", "tot_2012", "dem_2016", "rep_2016", "oth_2016", "tot_2016", "dem_2020", "rep_2020", "oth_2020", "tot_2020"]; //list of attributes
    var expressed = attrArray[0]; //initial attribute
    
    //chart frame dimensions
    var chartWidth = window.innerWidth * 0.225,
        chartHeight = window.innerHeight * 0.95 - 100;
        leftPadding = 35,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2 + topBottomPadding,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    //create a scale to size bars proportionally to frame and for axis
    var yScale = d3.scaleLinear()
        .range([((window.innerHeight * .95 - 100) - 10), 0])
        .domain([0, 2750]);

    //begin script when window loads
    window.addEventListener('load', function() {
        setMap();
    });
    
    //set up choropleth map
    function setMap() {
        
        //map frame dimensions
        var width = window.innerWidth * 0.72,
            height = window.innerHeight * 0.95-100;
    
        //create container div for the map and chart
        var container = d3.select("body")
            .append("div")
            .attr("class", "svg-container1");
        
        //create new svg container for the map
        var map = container.append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height)
            .call(d3.zoom() // Add zoom behavior
                .scaleExtent([1, 8]) // Define the minimum and maximum zoom scale
                .on("zoom", zoomed)); // On zoom, call the zoomed function
        
        // Create a group to hold all map elements (paths, etc.)
        var g = map.append("g");

        //create Albers equal area conic projection centered on Virginia
        var projection = d3.geoAlbers()
            .center([0, 37.53])
            .rotate([77.55, 0, 0])
            .parallels([36, 39])
            .scale(170000)
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
            var csvData = data[0],
                virginia = data[1],
                richmond = data[2];
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

            //add coordinated visualization to the map
            setChart(csvData, colorScale);

            //add dropdown menu to the map
            createDropdown(csvData);

            function setTitle(){
                // Title content
                var titleAttribute = "Voter Counts by Precinct";
                var subtitleAttribute = "Mouse over for details"
            
                // Calculate the right position for the title box
                var titleBoxWidth = 400;  // Fixed width for the title box
                var titleBoxHeight = 60;
                var titleX = width - 40 - titleBoxWidth;  // Position the box 10 pixels from the right edge
                var titleY = 60;  // Some padding from the top
            
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

        
    }

    // Function to handle zoom events
    function zoomed(event) {
        g.attr("transform", event.transform); // Apply the transformation to the group
    
    }; //end of setMap()


    function joinData(richmondPrecincts, csvData){
    
        //variables for data join
        //var attrArray = ["participation_2020", "participation_2016", "participation_2012", "participation_2008","participation_2004"];
    
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
            .attr("class", "precinctlabels2")
            .attr("text-anchor", "middle")
            .attr("x", function(d) {
                return path.centroid(d)[0];
            })
            .attr("y", function(d) {
                return path.centroid(d)[1];
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
            "#f2f0f7",
            "#cbc9e2",
            "#9e9ac8",
            "#756bb1",
            "#54278f"
        ];
    
        //create color scale generator
        var colorScale = d3.scaleThreshold()
            .range(colorClasses);
    
        //build array of all values of the expressed attribute
        var domainArray = [];
        for (var i=0; i<data.length; i++){
            var val = parseFloat(data[i][expressed]);
            domainArray.push(val);
        };
    
        //cluster data using ckmeans clustering algorithm to create natural breaks
        var clusters = ss.ckmeans(domainArray, 5);
        //reset domain array to cluster minimums
        domainArray = clusters.map(function(d){
            return d3.min(d);
        });
        //remove first value from domain array to create class breakpoints
        domainArray.shift();

        //assign array of expressed values as scale domain
        colorScale.domain(domainArray);
    
        //console.log(clusters)
    
        return colorScale;
    };
    
    //function to create a dropdown menu for attribute selection
    function createDropdown(csvData){
        //add select element
        var dropdown = d3.select("body")
            .append("select")
            .attr("class", "dropdown")
            .on("change", function(){
                changeAttribute(this.value, csvData)
            });

        //add initial option
        var titleOption = dropdown.append("option")
            .attr("class", "titleOption")
            .attr("disabled", "true")
            .text("Select Attribute");

        // Mapping of attribute names to user-friendly labels
        var labelMap = {
            "dem_1996": "1996 - Dems",
            "rep_1996": "1996 - Reps",
            "oth_1996": "1996 - Others",
            "tot_1996": "1996 - Total",
            "dem_2000": "2000 - Dems",
            "rep_2000": "2000 - Reps",
            "oth_2000": "2000 - Others",
            "tot_2000": "2000 - Total",
            "dem_2004": "2004 - Dems",
            "rep_2004": "2004 - Reps",
            "oth_2004": "2004 - Others",
            "tot_2004": "2004 - Total",
            "dem_2008": "2008 - Dems",
            "rep_2008": "2008 - Reps",
            "oth_2008": "2008 - Others",
            "tot_2008": "2008 - Total",
            "dem_2012": "2012 - Dems",
            "rep_2012": "2012 - Reps",
            "oth_2012": "2012 - Others",
            "tot_2012": "2012 - Total",
            "dem_2016": "2016 - Dems",
            "rep_2016": "2016 - Reps",
            "oth_2016": "2016 - Others",
            "tot_2016": "2016 - Total",
            "dem_2020": "2020 - Dems",
            "rep_2020": "2020 - Reps",
            "oth_2020": "2020 - Others",
            "tot_2020": "2020 - Total"
        };

        //add attribute name options with user-friendly labels
        var attrOptions = dropdown.selectAll("attrOptions")
            .data(attrArray)
            .enter()
            .append("option")
            .attr("value", function(d){ return d; })
            .text(function(d){ return labelMap[d]; });
    };

    //dropdown change event handler
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

        //Sort, resize, and recolor bars
        var bars = d3.selectAll(".bar")
            //Sort bars
            .sort(function(a, b){
                return b[expressed] - a[expressed];
            })
            .transition() //add animation
            .delay(function(d, i){
                return i * 20
            })
            .duration(500);

        updateChart(bars, csvData.length, colorScale);

    };

    //function to create coordinated bar chart
    function setChart(csvData, colorScale){
        

        //create a second svg element to hold the bar chart
        var chart = d3.select(".svg-container1")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("class", "chart");

        //create a rectangle for chart background fill
        var chartBackground = chart.append("rect")
            .attr("class", "chartBackground")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);

        

        //set bars for each municipality
        var bars = chart.selectAll(".bar")
            .data(csvData)
            .enter()
            .append("rect")
            .sort(function(a, b){
                return b[expressed]-a[expressed]
            })
            .attr("class", function(d){
                return "bar " + d.precinct;
            })
            .attr("width", chartInnerWidth / csvData.length - 1)
            
            .on("mouseover", function(event, d){
                highlight(d)
            })
            .on("mouseout", function(event, d){
                dehighlight(d);
            })
            .on("mousemove", moveLabel);

        //add style descriptor to each rect
        var desc = bars.append("desc")
            .text('{"stroke": "none", "stroke-width": "0px"}');

        // Mapping of attribute names to user-friendly labels
        var labelMap = {
            "dem_1996": "1996 - Dems",
            "rep_1996": "1996 - Reps",
            "oth_1996": "1996 - Others",
            "tot_1996": "1996 - Total",
            "dem_2000": "2000 - Dems",
            "rep_2000": "2000 - Reps",
            "oth_2000": "2000 - Others",
            "tot_2000": "2000 - Total",
            "dem_2004": "2004 - Dems",
            "rep_2004": "2004 - Reps",
            "oth_2004": "2004 - Others",
            "tot_2004": "2004 - Total",
            "dem_2008": "2008 - Dems",
            "rep_2008": "2008 - Reps",
            "oth_2008": "2008 - Others",
            "tot_2008": "2008 - Total",
            "dem_2012": "2012 - Dems",
            "rep_2012": "2012 - Reps",
            "oth_2012": "2012 - Others",
            "tot_2012": "2012 - Total",
            "dem_2016": "2016 - Dems",
            "rep_2016": "2016 - Reps",
            "oth_2016": "2016 - Others",
            "tot_2016": "2016 - Total",
            "dem_2020": "2020 - Dems",
            "rep_2020": "2020 - Reps",
            "oth_2020": "2020 - Others",
            "tot_2020": "2020 - Total"
        };

        // Get the user-friendly label for the expressed attribute
        var expressedLabel = labelMap[expressed];
        
        //create a text element for the chart title
        var chartTitle = chart.append("text")
            .attr("x", 70)
            .attr("y", 40)
            .attr("class", "chartTitle")
            .text("Breakdown of " + expressedLabel);

        //create vertical axis generator
        var yAxis = d3.axisLeft()
            .scale(yScale);

        //place axis
        var axis = chart.append("g")
            .attr("class", "axis")
            .attr("transform", translate)
            .call(yAxis);

        //create frame for chart border
        var chartFrame = chart.append("rect")
            .attr("class", "chartFrame")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);

        //set bar positions, heights, and colors
        updateChart(bars, csvData.length, colorScale);

    }; //end of setChart()

    
    //function to position, size, and color bars in chart
    function updateChart(bars, n, colorScale){

        // Mapping of attribute names to user-friendly labels
        var labelMap = {
            "dem_1996": "1996 - Dems",
            "rep_1996": "1996 - Reps",
            "oth_1996": "1996 - Others",
            "tot_1996": "1996 - Total",
            "dem_2000": "2000 - Dems",
            "rep_2000": "2000 - Reps",
            "oth_2000": "2000 - Others",
            "tot_2000": "2000 - Total",
            "dem_2004": "2004 - Dems",
            "rep_2004": "2004 - Reps",
            "oth_2004": "2004 - Others",
            "tot_2004": "2004 - Total",
            "dem_2008": "2008 - Dems",
            "rep_2008": "2008 - Reps",
            "oth_2008": "2008 - Others",
            "tot_2008": "2008 - Total",
            "dem_2012": "2012 - Dems",
            "rep_2012": "2012 - Reps",
            "oth_2012": "2012 - Others",
            "tot_2012": "2012 - Total",
            "dem_2016": "2016 - Dems",
            "rep_2016": "2016 - Reps",
            "oth_2016": "2016 - Others",
            "tot_2016": "2016 - Total",
            "dem_2020": "2020 - Dems",
            "rep_2020": "2020 - Reps",
            "oth_2020": "2020 - Others",
            "tot_2020": "2020 - Total"
        };

        // Get the user-friendly label for the expressed attribute
        var expressedLabel = labelMap[expressed];

        //position bars
        bars.attr("x", function(d, i){
            return i * (chartInnerWidth / n) + leftPadding;
        })
        //size/resize bars
        .attr("height", function(d, i){
            return (window.innerHeight - 10) - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        //color/recolor bars
        .style("fill", function(d){            
            var value = d[expressed];            
            if(value) {                
                return colorScale(value);            
            } else {                
                return "#ccc";            
            }    
        });

        var chartTitle = d3.select(".chartTitle")
            .text("Breakdown of " + expressedLabel);
    }

    //function to highlight enumeration units and bars
    function highlight(props){
        //change stroke
        var selected = d3.selectAll("." + props.precinct)
            .style("stroke", "white")
            .style("stroke-width", "2");
        setLabel(props);
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

// Function to create dynamic label
function setLabel(props){
    // Mapping of attribute names to user-friendly labels
    var labelMap = {
        "dem_1996": "1996 - Dems",
        "rep_1996": "1996 - Reps",
        "oth_1996": "1996 - Others",
        "tot_1996": "1996 - Total",
        "dem_2000": "2000 - Dems",
        "rep_2000": "2000 - Reps",
        "oth_2000": "2000 - Others",
        "tot_2000": "2000 - Total",
        "dem_2004": "2004 - Dems",
        "rep_2004": "2004 - Reps",
        "oth_2004": "2004 - Others",
        "tot_2004": "2004 - Total",
        "dem_2008": "2008 - Dems",
        "rep_2008": "2008 - Reps",
        "oth_2008": "2008 - Others",
        "tot_2008": "2008 - Total",
        "dem_2012": "2012 - Dems",
        "rep_2012": "2012 - Reps",
        "oth_2012": "2012 - Others",
        "tot_2012": "2012 - Total",
        "dem_2016": "2016 - Dems",
        "rep_2016": "2016 - Reps",
        "oth_2016": "2016 - Others",
        "tot_2016": "2016 - Total",
        "dem_2020": "2020 - Dems",
        "rep_2020": "2020 - Reps",
        "oth_2020": "2020 - Others",
        "tot_2020": "2020 - Total"
    };

    // Get the user-friendly label for the expressed attribute
    var expressedLabel = labelMap[expressed];

    // Label content with user-friendly label
    var labelAttribute = "<h1>Vote count: " + props[expressed] +
        "</h1><br><b>for " + expressedLabel + "</b>";

    // Create info label div
    var infolabel = d3.select("body")
        .append("div")
        .attr("class", "infolabel")
        .attr("id", props.precinct + "_label")
        .html(labelAttribute);

    var precinctName = infolabel.append("div")
        .attr("class", "labelname")
        .html("Precinct: " + props.ID);
}

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

}
})(); //last line of main.js