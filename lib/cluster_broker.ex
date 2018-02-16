defmodule SmileItDemoUi.ClusterBroker do
    use GenServer

    def init(_) do
        :os.cmd 'epmd -daemon'
        {:ok, {:no_master, %{}}}
    end
    

    def start_link() do 
      Node.start(get_name())
      Node.set_cookie(:marlon_cluster)
      GenServer.start_link(__MODULE__, [], name: :broker_node)
    end    

    def handle_call(:get_nodes, _from, {master, nodes}) do
        nodesList = Enum.reduce(nodes, [], fn ({k, v}, acc) -> [%{key: k, node: k, status: v.status, parent: v.parent} | acc] end)
        {:reply, nodesList, {master, nodes}}
    end

    def handle_cast({:join, node, :master}, {_master, nodes}) do
      # broadcast here  
      IO.puts "Master node #{node}  joined the cluster!"
      SmileItDemoUiWeb.Endpoint.broadcast "cluster:view", "join", %{ "key" => node,"node" => node, "status" => "online" ,"parent" => -1}
      {:noreply, {node, Map.put_new(nodes, node, %{parent: -1, status: "online"})}}
    end

    def handle_cast({:join, node, :slave}, {master, nodes}) do
        # broadcast here  
        IO.puts "Slave node #{node}  joined the cluster!"
        SmileItDemoUiWeb.Endpoint.broadcast "cluster:view", "join", %{ "key" => node,"node" => node, "status" => "online" ,"parent" => master}
        {:noreply, {master, Map.put_new(nodes, node, %{parent: master, status: "online"})}}
      end

    def handle_cast({:leave, node}, {master, nodes}) do
        # broadcast here  
        IO.puts "Node #{node} leaved the cluster!"
        SmileItDemoUiWeb.Endpoint.broadcast "cluster:view", "leave", %{ "node" => node}
        {:noreply, {master, Map.delete(nodes, node)}}
    end

    def handle_cast({:update, node, status}, {master, nodes}) do
        # broadcast here  
        IO.puts "Node #{node} status= #{status} updated!"
        SmileItDemoUiWeb.Endpoint.broadcast "cluster:view", "update", %{ "node" => node, "status" => status}
        nodes = put_in nodes[node].status, status
        {:noreply, {master, nodes}}
      end

    defp get_name do
        {:ok, [{ {n1, n2, n3, n4}, _ ,_} | _rest]} = :inet.getif()
        :"broker@#{n1}.#{n2}.#{n3}.#{n4}"
      end
  end