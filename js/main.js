var drawSpiral = function(g, gHeight, gWidth,lineHeight,lineWidth,spiralData,lineData,SpiralDataSize) {
    var width = gWidth,
      height = gHeight,
      start = 0,
      end = 2.25,
      numSpirals = 3
      margin = {top:50,bottom:50,left:50,right:50};

    var theta = function(r) {
      return numSpirals * Math.PI * r;
    };

    // used to assign nodes color by group
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var r = d3.min([width, height]) / 2 - 40;

    var radius = d3.scaleLinear()
      .domain([start, end])
      .range([40, r]);

    var svg = g.append("g").attr("class", "SpiralClass")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var points = d3.range(start, end + 0.001, (end - start) / 1000);

    var spiral = d3.radialLine()
      .curve(d3.curveCardinal)
      .angle(theta)
      .radius(radius);

    var path = svg.append("path")
      .datum(points)
      .attr("id", "spiral")
      .attr("d", spiral)
      .style("fill", "none")
      .style("stroke", "steelblue");

    var spiralLength = path.node().getTotalLength(),
  
        N = SpiralDataSize,
        barWidth = (spiralLength / N) - 1;
  
   var someData = [];
   
   d3.csv(spiralData, function(data) {
    
    for (var i = 0; i < N; i++) {
   // console.log(data[i].date);
   var testDate = data[i].date;
   var res = testDate.split("-");
   var formatMonth = d3.timeFormat("%B"),
       formatDay = d3.timeFormat("%A"),
       dat = new Date(res[0],res[1]-1,res[2]);
       
  	//console.log(dat.getMonth());
  	var val = data[i].count;//Math.floor(Math.random() * (10 - 1)) + 1;
  //	console.log(val);

  	
  	someData.push({
        date: dat,
        value: val,
        group: dat.getMonth()
     });
  }


    var timeScale = d3.scaleTime()
      .domain(d3.extent(someData, function(d){
        return d.date;
      }))
      .range([0, spiralLength]);
    
    // yScale for the bar height
    var yScale = d3.scaleLinear()
      .domain([0, d3.max(someData, function(d){
        return d.value;
      })])
      .range([0, (r / numSpirals) - 40]);//added for bar height

    svg.selectAll("rect")
      .data(someData)
      .enter()
      .append("rect")
        .attr("class",function(d){
            var date = d.date.toDateString().split(" ");
            return "SpiralRect " + date[1]+date[3];
        })
      .attr("x", function(d,i){
        
        var linePer = timeScale(d.date),
            posOnLine = path.node().getPointAtLength(linePer),
            angleOnLine = path.node().getPointAtLength(linePer - barWidth);
      
        d.linePer = linePer; // % distance are on the spiral
        d.x = posOnLine.x; // x postion on the spiral
        d.y = posOnLine.y; // y position on the spiral
        
        d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90; //angle at the spiral position

        return d.x;
      })
      .attr("y", function(d){
        return d.y;
      })
      .attr("width", function(d){
        return barWidth;
      })
      .attr("height", function(d){
        return yScale(d.value);
      })
      .style("fill", function(d){return color(d.group);})
      .style("stroke", function(d){return color(d.group);}).style("stroke-width","6px")
      .attr("transform", function(d){
        return "rotate(" + d.a + "," + d.x  + "," + d.y + ")"; // rotate the bar
      });
    
    // add date labels
    var tF = d3.timeFormat("%b %Y"),
        firstInMonth = {};

    svg.selectAll("text")
      .data(someData)
      .enter()
      .append("text")
      .attr("dy", 10)
      .style("text-anchor", "start")
      .style("font", "10px arial")
      .append("textPath")
      // only add for the first of each month
      .filter(function(d){
        var sd = tF(d.date);
        if (!firstInMonth[sd]){
          firstInMonth[sd] = 1;
          return true;
        }
        return false;
      })
      .text(function(d){
        return tF(d.date);
      })
      // place text along spiral
      .attr("xlink:href", "#spiral")
      .style("fill", "grey")
      .attr("startOffset", function(d){
        return ((d.linePer / spiralLength) * 100) + "%";
      })


    var tooltip = d3.select("body")
    .append('div')
    .attr('class', 'tooltip');

    tooltip.append('div')
    .attr('class', 'date');
    tooltip.append('div')
    .attr('class', 'value');

    svg.selectAll(".SpiralRect")
    .on('mouseover', function(d) {
        //console.log("in mouse over");
		 var res = d.date.toDateString().split(" ");
        tooltip.select('.date').html("Month and Year: <b>" + res[1] + res[3] + "</b>");
        var val = Math.round((((d.value-0.1)*(39.0))+1.0 )*100)/100;
        //console.log("cal"+val);
        tooltip.select('.value').html("check in: <b>" + val + "<b>");


        var SelectName = "."+res[1]+res[3];
        d3.selectAll(SelectName)
        .style("fill","#2c24ed")
        .style("stroke","#2c24ed")
        .style("stroke-width","6px");

        tooltip.style('display', 'block');
        tooltip.style('opacity',2);

    })
    .on('mousemove', function(d) {
        tooltip.style('top', (d3.event.layerY + 10) + 'px')
        .style('left', (d3.event.layerX - 25) + 'px');
    })
        .on('click',function(d) {
            //console.log("in mouse over");
            var res = d.date.toDateString().split(" ");
            //tooltip.select('.date').html("Month and Year: <b>" + res[1] + res[3] + "</b>");
            //tooltip.select('.value').html("check in: <b>" + Math.round(d.value*100)/100 + "<b>");
            tooltip.style('display', 'none');
            var SelectName = "."+res[1]+res[3];
            d3.selectAll(SelectName)
                .style("fill","#000000")
                .style("stroke","#000000")
                .style("stroke-width","6px");
            var monthYear = res[1] + "-"+res[3];
            drawLine(gLine,lineHeight,lineWidth,lineData,monthYear);
            //tooltip.style('display', 'block');
            //tooltip.style('opacity',2);

        })
    .on('mouseout', function(d) {
        d3.selectAll("rect")
        .style("fill", function(d){return color(d.group);})
        .style("stroke", function(d){return color(d.group);}).style("stroke-width","6px")

        tooltip.style('display', 'none');
        tooltip.style('opacity',0);
    });
});
}