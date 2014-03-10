$(document).ready(function(){
   
    var margin = {top: 10, right: 40, bottom: 150, left: 60},
    width = 940 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    contextHeight = 50;
    contextWidth = width * .5;

    var svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", (height + margin.top + margin.bottom));



    d3.csv('emotion_data.csv', createChart);
      
    


    function createChart(data){
        var emotions = ['accusation', 'anger', 'disgust', 'fear', 'happiness', 'no', 'sadness', 'surprise'],
            charts = [],
            maxDataPoint = 0;

        var emotionsCount = emotions.length;

        startTime = data[0].time,
        endTime = data[18].time,
        chartHeight = height * (1 / emotionsCount);


        data.forEach(function(d) {
            

            d["  "] = parseFloat(d["number of messages"])
            if (d["number of messages"] > maxDataPoint) {
                maxDataPoint = d["number of messages"];
            }
            //parse time if need HH:MM:SS
        });


      for(var i = 0; i < emotionsCount; i++) {
            charts.push( new Chart({
                data: data.slice(),
                id: i,
                name: emotions[i],
                width: width,
                height: height * (1 / emotionsCount),
                maxDataPoint: maxDataPoint,
                svg: svg,
                margin: margin,
                showBottomAxis: (i == emotions.length - 1)
            }));

        }

 

    }


function Chart(options){
    this.chartData = options.data;
    this.width = options.width;
    this.height = options.height;
    this.maxDataPoint = options.maxDataPoint;
    this.svg = options.svg;
    this.id = options.id;
    this.name = options.name;
    this.margin = options.margin;
    this.showBottomAxis = options.showBottomAxis;
                         
    var localName = this.name;


    
    //XScale is time based
    this.xScale = d3.time.scale()
                .range([0, this.width])
                .domain(d3.extent(this.chartData.map(function(d) { return d.time; })));
                                 
    //YScale is linear based on the maxData Point we found earlier
    this.yScale = d3.scale.linear()
                .range([this.height,0])
                .domain([0,this.maxDataPoint]);


    var xS = this.xScale;
    var yS = this.yScale;
 
    this.area = d3.svg.area()
            .interpolate("basis")
            .x(function(d) { return xS(d.time); })
            .y0(this.height)
            .y1(function(d) { return yS(d[localName]); });


    //technically don't need this?
    this.svg.append("defs").append("clipPath")
                .attr("id", "clip-" + this.id)
               .append("rect")
                .attr("width", this.width)
                .attr("height", this.height);


    this.chartContainer = svg.append("g")
                .attr('class',this.name.toLowerCase())
                .attr("transform", "translate(" + this.margin.left + "," + (this.margin.top + (this.height * this.id) + (10 * this.id)) + ")");


    this.chartContainer.append("path")
            .data([options.data])
            .attr("class", "chart")
            .attr("clip-path", "url(#clip-" + this.id + ")")
            .attr("d", this.area);
     
       
    this.xAxisTop = d3.svg.axis().scale(this.xScale).orient("bottom");
    this.xAxisBottom = d3.svg.axis().scale(this.xScale).orient("top");


        //top axis on first emotion
    if(this.id == 0){
        this.chartContainer.append("g")
                .attr("class", "x axis top")
                .attr("transform", "translate(0,0)")
                .call(this.xAxisTop);


        //bottom axis on last emotion
     
        if(this.showBottomAxis){
            this.chartContainer.append("g")
                .attr("class", "x axis bottom")
                .attr("transform", "translate(0," + this.height + ")")
                .call(this.xAxisBottom);
        }

        this.yAxis = d3.svg.axis().scale(this.yScale).orient("left").ticks(5);
                                     
        this.chartContainer.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(-15,0)")
                .call(this.yAxis);
        this.chartContainer.append("text")
                .attr("class","country-title")
                .attr("transform", "translate(15,40)")
                .text(this.name);
    }       


}


    var contextXScale = d3.time.scale()
                    .range([0, contextWidth])
                    .domain(charts[0].xScale.domain()); 
                             
    var contextAxis = d3.svg.axis()
                .scale(contextXScale)
                .tickSize(contextHeight)
                .tickPadding(-10)
                .orient("bottom");
                                 
    var contextArea = d3.svg.area()
                .interpolate("monotone")
                .x(function(d) { return contextXScale(d.date); })
                .y0(contextHeight)
                .y1(0);
                 
    var brush = d3.svg.brush()
                .x(contextXScale)
                .on("brush", onBrush);
                 
    var context = svg.append("g")
            .attr("class","context")
            .attr("transform", "translate(" + (margin.left + width * .25) + "," + (height + margin.top + chartHeight) + ")");
         
    context.append("g")
            .attr("class", "x axis top")
            .attr("transform", "translate(0,0)")
            .call(contextAxis);
     
    context.append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", 0)
            .attr("height", contextHeight);
     
    context.append("text")
            .attr("class","instructions")
            .attr("transform", "translate(0," + (contextHeight + 20) + ")")
            .text('Click and drag above to zoom / pan the data');

    function onBrush(){
        
        //this will return a date range to pass into the chart object 
        
     
        var b = brush.empty() ? contextXScale.domain() : brush.extent();
     
        for(var i = 0; i < emotionsCount; i++){
            charts[i].showOnly(b);
        }
    }


    

    Chart.prototype.showOnly = function(b){
        this.xScale.domain(b);
        this.chartContainer.select("path").data([this.chartData]).attr("d", this.area);
        this.chartContainer.select(".x.axis.top").call(this.xAxisTop);
        this.chartContainer.select(".x.axis.bottom").call(this.xAxisBottom);
    }


                 
    .axis path, .axis line {
        fill: none;
        stroke: #aaa;
        shape-rendering: crispEdges;
    }

});