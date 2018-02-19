
use Mix.Config

# Configures the endpoint
config :smile_it_demo_ui, SmileItDemoUiWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "/bytVRunQxwRMpbJ15th2HpDDHJchOMwl+SvoIjLMgnjcxtL9wdT8S3aoIsAneFa",
  render_errors: [view: SmileItDemoUiWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: SmileItDemoUi.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

import_config "#{Mix.env}.exs"
