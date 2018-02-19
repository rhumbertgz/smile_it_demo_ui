defmodule SmileItDemoUi.StateStore do
    use Agent
  
    @doc """
    Starts a new bucket.
    """
    def start_link() do
      Agent.start_link(fn -> %{} end, [name: StateStore])
    end
  
    @doc """
    Gets a value from the `bucket` by `key`.
    """
    def get(node) do
      case Agent.get(StateStore, &Map.get(&1, node)) do
        nil -> []
        list -> list
      end    
      
    end
  
    @doc """
    Puts the `value` for the given `key` in the `bucket`.
    """
    def add(node, value) do
      states =  
        case SmileItDemoUi.StateStore.get(node) do
         list -> [value | list]
        end   
      Agent.update(StateStore, &Map.put(&1, node, states))
    end

    def delete(node) do
        Agent.update(StateStore, &Map.delete(&1, node))
    end
end