# app/controllers/embedding_cluster_controller.rb

module EmbeddingCluster
  class EmbeddingClusterController < ::ApplicationController
    def index
      render json: { data: get_cluster_data }
    end

    private

    def get_cluster_data
      # Replace with the actual path to your generated JSON file
      JSON.parse(File.read('/path/to/embedding_cluster_data.json'))
    rescue Errno::ENOENT
      []
    end
  end
end
