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
      file_path = Rails.root.join('plugins/discourse-embedding-cluster/data', 'tsne.csv')
      data = []
      begin
        CSV.foreach(file_path, headers: true) do |row|
          x = row['TSNE1'].to_f
          y = row['TSNE2'].to_f
          id = row['topic_id']
          excerpt = row['excerpt']
          title = row['title']
          category = row['category']
          tags = row['tags']

          data << { id: id, x: x, y: y, 
                  title: title, excerpt: excerpt,
                  category: category, tags: tags}
        end
      rescue Errno::ENOENT
        STDERR.puts "File not found: #{file_path}"
        return []
      rescue CSV::MalformedCSVError => e
        STDERR.puts "Malformed CSV: #{e.message}"
        return []
      end

      data
    end
  end
end