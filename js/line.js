var drawLine = function(g, gHeight, gWidth,fname,MonthYear){

  var svg = g,
    margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = gWidth - margin.left - margin.right,
    height = gHeight - margin.top - margin.bottom;

  d3.selectAll(".lineClass").remove();
  var g = svg.append("g")
        .attr("class","lineClass")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%d-%b-%y");

var x = d3.scaleTime()
    .rangeRound([0, width]);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var line = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });

//console.log("sdff");
d3.tsv(fname, function(d) {

  d.date = parseTime(d.date);
    var res = d.date.toDateString().split(" ");
    var monyear = res[1] + "-"+res[3];
    //console.log(MonthYear);
    //console.log(monyear);
  d.close = +d.close;
  if(MonthYear=="init"){
    console.log("initlo");
    return d;
  }
  if(monyear==MonthYear){
  return d;}
}, function(error, data) {
  if (error) throw error;

  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain(d3.extent(data, function(d) { return d.close; }));

  g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
    .select(".domain")
      .remove();

  g.append("g")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("check-in");

  g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);
});
}