defmodule SmileItDemoUiWeb.PageController do
  use SmileItDemoUiWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
