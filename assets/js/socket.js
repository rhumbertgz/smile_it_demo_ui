// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "assets/js/app.js".

// To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/web/endpoint.ex":
import {Socket} from "phoenix"

let socket = new Socket("/socket", {params: {token: window.userToken}})
export var clusterView = {canvas: "test"}

socket.connect()

// Now that you are connected, you can join channels with a topic:
let channel = socket.channel("cluster:view", {})

// let chatInput         = document.querySelector("#chat-input")
// let messagesContainer = document.querySelector("#messages")

// chatInput.addEventListener("keypress", event => {
//   if(event.keyCode === 13){
//     channel.push("new_msg", {body: chatInput.value})
//     chatInput.value = ""
//   }
// })

channel.on("join", payload => {
  console.log("Node %s joined successfully", payload.node) 
  clusterView.canvas.startTransaction("add new node");
  var newNode = { key: payload.key, node: payload.node, status: payload.status, parent: payload.parent };
  clusterView.canvas.model.addNodeData(newNode);
  clusterView.canvas.commitTransaction("add new node");
})

channel.on("leave", payload => {
  console.log("Node %s leaved successfully", payload.node) 
  clusterView.canvas.startTransaction("remove node");
  var node = clusterView.canvas.findNodeForKey(payload.node);
  clusterView.canvas.model.removeNodeData(node.data);
  clusterView.canvas.commitTransaction("remove node");
})

channel.on("update", payload => {
  console.log("Node %s status updated : %s", payload.node, payload.status) 
  clusterView.canvas.startTransaction("update node status");
  var node = clusterView.canvas.findNodeForKey(payload.node);
  clusterView.canvas.model.setDataProperty(node.data, "status", payload.status);
  clusterView.canvas.commitTransaction("remove node status");
})

channel.join()
  .receive("ok", resp => { 
                          var model = { "class": "go.TreeModel", "nodeDataArray": resp.nodes};
                          clusterView.canvas.model = go.Model.fromJson(model)
                        })
  .receive("error", resp => { console.log("Unable to join", resp) })


export default socket
// export var clusterView

