// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "assets/js/app.js".

// To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/web/endpoint.ex":
import {Socket} from "phoenix"

let socket = new Socket("/socket", {params: {token: window.userToken}})
export var clusterView = {canvas: ""}
export var scheduleView = {addNodes: "", removeNode: "", setTimeline: ""}

socket.connect()

let channel = socket.channel("cluster:view", {})

channel.on("join", payload => {
  console.log("Node %s joined successfully", payload.node) 
  clusterView.canvas.startTransaction("add new node");
  var newNode = { key: payload.key, node: payload.node, status: payload.status, parent: payload.parent };
  clusterView.canvas.model.addNodeData(newNode);
  clusterView.canvas.commitTransaction("add new node");
  var nodes = [{name: payload.node, datasets:[]}];
  scheduleView.addNodes(nodes);

})

channel.on("leave", payload => {
  console.log("Node %s leaved successfully", payload.node) 
  clusterView.canvas.startTransaction("remove node");
  var node = clusterView.canvas.findNodeForKey(payload.node);
  clusterView.canvas.model.removeNodeData(node.data);
  clusterView.canvas.commitTransaction("remove node");
  scheduleView.removeNode(payload.node);
})

channel.on("update", payload => {
  console.log("Node %s status updated : %s", payload.node, payload.status) 
  clusterView.canvas.startTransaction("update node status");
  var node = clusterView.canvas.findNodeForKey(payload.node);
  clusterView.canvas.model.setDataProperty(node.data, "status", payload.status);
  clusterView.canvas.commitTransaction("remove node status");
  console.log(payload.history);
  var node = {name: payload.node, datasets: payload.history}
  scheduleView.setTimeline(node);
})

channel.join()
  .receive("ok", resp => { 
                          var model = { "class": "go.TreeModel", "nodeDataArray": resp.nodes};
                          clusterView.canvas.model = go.Model.fromJson(model)
                          scheduleView.addNodes(resp.states);
                        })
  .receive("error", resp => { console.log("Unable to join", resp) })


export default socket

