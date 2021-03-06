defmodule SmileItDemoUiWeb.ClusterChannel do
    use Phoenix.Channel
  
    def join("cluster:view", _message, socket) do
      {:ok, restore_history(), socket} #  {:ok, reply, socket}
    end
    def join("cluster:" <> _private_clluster_id, _params, _socket) do
      {:error, %{reason: "unauthorized"}}
    end

    defp restore_history() do
      {:ok, [{ {n1, n2, n3, n4}, _ ,_} | _rest]} = :inet.getif()
      broker = :"broker@#{n1}.#{n2}.#{n3}.#{n4}"
      GenServer.call({:broker_node, broker}, :restore)
    end 
  end