defmodule SmileItDemoUi.ClusterBroker do
    use GenServer

    def init(_) do
        {:ok, {:no_master, %{}}}
    end
    

    def start_link() do 
      :os.cmd 'epmd -daemon'
      Node.start(get_name())
      Node.set_cookie(:marlon_cluster)
      GenServer.start_link(__MODULE__, [], name: :broker_node)
      SmileItDemoUi.StateStore.start_link()
    end    

    def handle_call(:restore, _from, {master, nodes}) do
        nodesList = Enum.reduce(nodes, [], fn ({k, v}, acc) -> [%{key: k, node: k, status: v.status, parent: v.parent} | acc] end)
        states = nodes 
                 |> Map.keys 
                 |> Enum.map(fn(n) -> %{name: n, datasets: build_dataset(n)} end) 
                 |> Enum.reverse
        {:reply, %{nodes: nodesList, states: states}, {master, nodes}}
    end

    def handle_cast({:join, clusterNode, :master}, {_master, nodes}) do
      # broadcast here  
    #   IO.puts "Master node #{clusterNode}  joined the cluster!"
      SmileItDemoUi.StateStore.add(clusterNode, {DateTime.utc_now(), "Doing nothing",})
      SmileItDemoUiWeb.Endpoint.broadcast "cluster:view", "join", %{ "key" => clusterNode,"node" => clusterNode, "status" => "Doing nothing" ,"parent" => -1}
      {:noreply, {clusterNode, Map.put_new(nodes, clusterNode, %{parent: -1, status: "online"})}}
    end

    def handle_cast({:join, clusterNode, :slave}, {master, nodes}) do
        # broadcast here  
        # IO.puts "Slave node #{clusterNode}  joined the cluster!"
        SmileItDemoUi.StateStore.add(clusterNode, { DateTime.utc_now(), "Doing nothing"})
        SmileItDemoUiWeb.Endpoint.broadcast "cluster:view", "join", %{ "key" => clusterNode,"node" => clusterNode, "status" => "Doing nothing" ,"parent" => master}
        {:noreply, {master, Map.put_new(nodes, clusterNode, %{parent: master, status: "online"})}}
      end

    def handle_cast({:leave, clusterNode}, {master, nodes}) do
        # broadcast here  
        # IO.puts "Node #{clusterNode} leaved the cluster!"
        SmileItDemoUi.StateStore.delete(clusterNode)
        SmileItDemoUiWeb.Endpoint.broadcast "cluster:view", "leave", %{ "node" => clusterNode}
        {:noreply, {master, Map.delete(nodes, clusterNode)}}
    end

    def handle_cast({:update, clusterNode, status}, {master, nodes}) do
        # broadcast here  
        # IO.puts "Node #{clusterNode} status= #{status} updated!"
        SmileItDemoUi.StateStore.add(clusterNode, {DateTime.utc_now(), status})
        history = build_dataset(clusterNode)
        SmileItDemoUiWeb.Endpoint.broadcast "cluster:view", "update", %{ "node" => clusterNode, "status" => status, "history" => history }
        nodes = put_in nodes[clusterNode].status, status
        {:noreply, {master, nodes}}
    end

    defp build_dataset(clusterNode) do
        [first | states] = clusterNode |> SmileItDemoUi.StateStore.get |> Enum.reverse
        build_chart_dataset(states, first, [])
    end    

    defp build_chart_dataset([], _lastState, ds), do: Enum.reverse(ds)
    defp build_chart_dataset([{t, _}=current | states], {lt,ls}, ds) do
        time = DateTime.diff(t, lt)
        color = get_color(ls)
        ds = [%{"data" => [time], "backgroundColor" => color} | ds]
        build_chart_dataset(states, current, ds)
    end

    defp get_color("Doing nothing"), do: "#d9d9d9"
    defp get_color("Communicating"), do: "#ffff1a"
    defp get_color("Processing"), do: "#cc0000"

    defp get_name do
        {:ok, [{ {n1, n2, n3, n4}, _ ,_} | _rest]} = :inet.getif()
        :"broker@#{n1}.#{n2}.#{n3}.#{n4}"
      end
  end