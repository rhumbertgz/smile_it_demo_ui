export function initialize(view){
    // if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
    var $ = go.GraphObject.make;  // for conciseness in defining templates
    
    var myDiagram =
      $(go.Diagram, "clusterDiagram", // must be the ID or reference to div
        {
          contentAlignment: go.Spot.Center,
          autoScale: go.Diagram.UniformToFill,
          maxSelectionCount: 1, // users can select only one part at a time
          validCycle: go.Diagram.CycleDestinationTree, // make sure users can only create trees
          "clickCreatingTool.archetypeNodeData": {}, // allow double-click in background to create a new node
          layout:
            $(go.TreeLayout,
              {
                treeStyle: go.TreeLayout.StyleLastParents,
                arrangement: go.TreeLayout.ArrangementHorizontal,
                // properties for most of the tree:
                angle: 90,
                layerSpacing: 35,
                // properties for the "last parents":
                alternateAngle: 90,
                alternateLayerSpacing: 35,
                alternateAlignment: go.TreeLayout.AlignmentBus,
                alternateNodeSpacing: 20
              }),
          "undoManager.isEnabled": true // enable undo & redo
        });
    var levelColors = ["#094AB2", "#008299"];
    // override TreeLayout.commitNodes to also modify the background brush based on the tree depth level
    myDiagram.layout.commitNodes = function() {
      go.TreeLayout.prototype.commitNodes.call(myDiagram.layout);  // do the standard behavior
      // then go through all of the vertexes and set their corresponding node's Shape.fill
      // to a brush dependent on the TreeVertex.level value
      myDiagram.layout.network.vertexes.each(function(v) {
        if (v.node) {
          var level = v.level % (levelColors.length);
          var color = levelColors[level];
          var shape = v.node.findObject("SHAPE");
          if (shape) shape.fill = $(go.Brush, "Linear", { 0: color, 1: go.Brush.lightenBy(color, 0.05), start: go.Spot.Left, end: go.Spot.Right });
        }
      });
    };
   
    // This function provides a common style for most of the TextBlocks.
    // Some of these values may be overridden in a particular TextBlock.
    function textStyle() {
      return { font: "9pt  Segoe UI,sans-serif", stroke: "white" };
    }
    // This is used by the Picture.
    function findHeadShot(key) {
      return "images/server48.png"
    }
    // define the Node template
    myDiagram.nodeTemplate =
      $(go.Node, "Auto",
        // for sorting, have the Node.text be the data.name
        new go.Binding("text", "node"),
        // bind the Part.layerName to control the Node's layer depending on whether it isSelected
        new go.Binding("layerName", "isSelected", function(sel) { return sel ? "Foreground" : ""; }).ofObject(),
        // define the node's outer shape
        $(go.Shape, "Rectangle",
          {
            name: "SHAPE", fill: "white", stroke: null,
            desiredSize: new go.Size(200, 65),
            // set the port properties:
            portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"
          }),
        $(go.Panel, "Horizontal",
          $(go.Picture,
            {
              name: "Picture",
              desiredSize: new go.Size(39, 50),
              margin: new go.Margin(6, 8, 6, 10),
            },
            new go.Binding("source", "key", findHeadShot)),
          // define the panel where the text will appear
          $(go.Panel, "Table",
            {
              maxSize: new go.Size(150, 999),
              margin: new go.Margin(6, 10, 0, 3),
              defaultAlignment: go.Spot.Left
            },
            $(go.RowColumnDefinition, { column: 2, width: 4 }),
            $(go.TextBlock, textStyle(),  // the name
              {
                row: 0, column: 0, columnSpan: 5,
                font: "12pt Segoe UI,sans-serif",
                editable: true, isMultiline: false,
                minSize: new go.Size(10, 16),
                margin: new go.Margin(10, 10, 0, 3)
                
              },
              new go.Binding("text", "node").makeTwoWay()),
            $(go.TextBlock, "Status: ", textStyle(),
              { row: 1, column: 0,
                margin: new go.Margin(10, 5, 10, 3) }),
            $(go.TextBlock, textStyle(),
              {
                row: 1, column: 1, columnSpan: 4,
                editable: true, isMultiline: false,
                minSize: new go.Size(10, 14),
                margin: new go.Margin(10, 10, 10, 3)
              },
              new go.Binding("text", "status").makeTwoWay())
          )  // end Table Panel
        ) // end Horizontal Panel
      );  // end Node
  
    // define the Link template
    myDiagram.linkTemplate =
      $(go.Link, go.Link.Orthogonal,
        { corner: 5, relinkableFrom: true, relinkableTo: true },
        $(go.Shape, { strokeWidth: 4, stroke: "#00a4a4" }));  // the link shape
    view.canvas = myDiagram
  }