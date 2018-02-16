defmodule SmileItDemoUiWeb.ClusterChannel do
    use Phoenix.Channel
  
    def join("cluster:view", message, socket) do
      IO.puts "hi"
      IO.inspect message
      IO.inspect socket
      {:ok, %{nodes: get_node_list()}, socket} #  {:ok, reply, socket}
    end
    def join("cluster:" <> _private_clluster_id, _params, _socket) do
      {:error, %{reason: "unauthorized"}}
    end

    defp get_node_list() do
      {:ok, [{ {n1, n2, n3, n4}, _ ,_} | _rest]} = :inet.getif()
      broker = :"broker@#{n1}.#{n2}.#{n3}.#{n4}"
      GenServer.call({:broker_node, broker}, :get_nodes)
    end 
  end