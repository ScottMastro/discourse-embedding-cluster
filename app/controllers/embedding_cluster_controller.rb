module EmbeddingCluster
  class EmbeddingClusterController < ::ApplicationController
    def index
      render template: 'embedding_cluster/index'  # Renders the view
    end

    def data
      render json: { data: fetch_cluster_data }
    end

    private

    def fetch_cluster_data
      # Example data for demonstration
      [{ x: 1, y: 2 }, { x: 3, y: 4 }]
    end
  end
end
