
export function init(){
    var nodes = [{name: "10.01.23.1", datasets:
    [ {data: [300], backgroundColor: '#ffff1a'},
      {data: [3000], backgroundColor: '#cc0000'},
      {data: [250], backgroundColor: '#ffff1a'},
      {data: [1400], backgroundColor: '#cc0000'},
      {data: [250], backgroundColor: '#ffff1a'},
      {data: [1400], backgroundColor: '#d9d9d9'},
      {data: [250], backgroundColor: '#ffff1a'},
    ]},
{name: "10.01.23.4", datasets:
    [
      {data: [300], backgroundColor: '#ffff1a'},
      {data: [3000],backgroundColor: '#cc0000'},
      {data: [3000],backgroundColor: '#d9d9d9'},
      {data: [250],backgroundColor: '#ffff1a'},
    ]},
{name: "10.01.23.8", datasets:
    [
      {data: [100], backgroundColor: '#ffff1a'},
      {data: [2000],backgroundColor: '#cc0000'},
      {data: [250],backgroundColor: '#d9d9d9'},
      {data: [4000],backgroundColor: '#cc0000'},
      {data: [500],backgroundColor: '#ffff1a'},
    ]}];

var colors = ["#cc0000", "#ffff1a"]; // Processing, Communicating

addNodes(nodes);
}


export function addNodes(nodes) {
  var schedule = document.getElementById('schedule-timeline');

  nodes.forEach(function(node) {
    addNodeSchedule(schedule, node);
  });
};

export function removeNode(name){
    var parent = document.getElementById('schedule-timeline');
    var child = document.getElementById(name+'-timeline-row');
    parent.firstChild.removeChild(child);
}

function addNodeSchedule(schedule, node){
  var row = schedule.insertRow(-1);
  row.id = node.name+'-timeline-row'
  var name = row.insertCell(0);
  var timeline = row.insertCell(1);
  name.innerHTML = node.name;

  var canvas = document.createElement("canvas");
  canvas.id = node.name+'-timeline-canvas'
  canvas.style = "display: block; height: 20px; width: 1050px";
  timeline.appendChild(canvas)

  initChart(canvas, node);
};

export function setTimeline(node){
  var chart = document.getElementById(node.name+'-timeline-canvas');
  var row = document.getElementById(node.name+'-timeline-row');
  row.removeChild(row.lastElementChild);
  
  var td = document.createElement("td");
  row.appendChild(td)

  var canvas = document.createElement("canvas");
  canvas.id = node.name+'-timeline-canvas'
  canvas.style = "display: block; height: 20px; width: 1050px";
  td.appendChild(canvas)

  initChart(canvas, node);
};

function initChart(canvas, node){
    var myChart = new Chart(canvas, {
        type: 'horizontalBar',
        data: {
          labels: [node.name],
          datasets: node.datasets,
        },
        options: {
          animation: {
                duration: 0
          },
          tooltips: {enabled: false},
          legend: {display :false},
          scales: {
            xAxes:[
                {
                  stacked: true,
                  display: false,
                  gridLines: {
                              display: false,
                              lineWidth: 0
                              }
                },
              ],
            yAxes: [
                    {
                      stacked: true,
                      display: false,
                      gridLines: {display: false}},
                   ]
          }
        }
      });
}
