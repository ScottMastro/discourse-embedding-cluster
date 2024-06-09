
module EmbeddingCluster
  class EmbeddingClusterController < ::ApplicationController
    def index
      # Your logic here, for example:
      @data = fetch_cluster_data
      render template: 'embedding_cluster/index'  # Renders the view
    end

    private

    def fetch_cluster_data
      # Replace with your actual data fetching logic
      # Return sample data for demonstration
      [{ x: 1, y: 2 }, { x: 3, y: 4 }]
    end
  end
end