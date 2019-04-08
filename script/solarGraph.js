class SolarGraph
{

  constructor(config) {
    this.svg = this.create_graph(config);
    this.sunrise_sunset_mapping = { "sunrise": 0, "sunset": 0, "noon": 0.5, "midnight": -0.5 }
  }

  create_graph(config) {
    var margin = config.margin;
    var width = config.width - margin.left - margin.right // Use the window's width
    var height = config.height - margin.left - margin.right // Use the window's width

    this.xScale = d3.scaleTime().range([0, width]);
    this.yScale = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

    var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xAxis = d3.axisBottom(this.xScale)
      .ticks(d3.timeHour.every(2))
        .tickFormat(d3.timeFormat('%H:%M'))
        .tickSize(0)
        .tickPadding(8);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height/2 + ")")
        .call(xAxis); // Create an axis component with d3.axisBottom

    var yAxis = d3.axisLeft(this.yScale);

    svg.append("g")
        .attr("class", "y axis")
      .call(yAxis); // Create an axis component with d3.axisLeft

    return svg;
  }

  add_solar_path(datePoints, show_circle_animation) {
    var graph_data_set = this.get_graph_data_set(datePoints);

    var path = this.svg.append("path")
      .datum(graph_data_set)
      .attr("class","line")
      .attr("d", d3.line()
        .curve(d3.curveBasis)
        .x((d)=> { return this.xScale(d.date); })
        .y((d) => { return this.yScale(d.value); }));

    if (show_circle_animation) {
      this.show_circle_animation(path, graph_data_set);
    }
  }

  show_circle_animation(path, graph_data_set)
  {
    var circle_pos_x = this.xScale(graph_data_set[0].date)
    var circle_pos_y = this.yScale(graph_data_set[0].value)

    var circle = this.svg.append("circle")
    .attr("r", 5)
    .attr("transform", "translate("
      + circle_pos_x + ", "
      + circle_pos_y + ")");

    circle.transition()
      .duration(1000)
//    .ease(d3.easeLinear)
      .attrTween("transform", translateAlong(path.node()));

    function translateAlong(path){
        var l = path.getTotalLength();
        return function(d, i, a) {
          return function(t) {
            var p = path.getPointAtLength(t * l);
            return "translate(" + p.x + "," + p.y + ")";
          };
    };}
  }

  get_graph_data_set() {
    var dataset = []

    datePoints.forEach((e) => {
      var obj = {}
      obj['date'] =  new Date(e['date'].format('YYYY-MM-DD hh:mm:ss A'))
      obj['value'] = this.sunrise_sunset_mapping[e['solar_state']]
      dataset.push(obj)
    })

    return dataset;
  }

}