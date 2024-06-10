import os
import pandas as pd
import numpy as np
from sklearn.manifold import TSNE
import plotly.express as px

def get_df(update=False):
    if not update and os.path.exists('processed_df.pkl'):
        print("Loading existing processed DataFrame from pickle...")
        df = pd.read_pickle('processed_df.pkl')
        return df
    
    # topic_id,model_version,strategy_version,digest,embeddings,created_at,updated_at
    embedding_df = pd.read_csv('elitefourum-2024-06-08-topic-embeddings-tail.csv')
    embedding_df.drop(columns=['created_at', 'updated_at'], inplace=True)

    # id,title,created_at,views,posts_count,user_id,like_count,category_id,slug,word_count,excerpt
    topic_df = pd.read_csv('elitefourum-2024-06-08-topic-data.csv')
    topic_dict = {5: "collecting", 7: "articles", 9: "general", 13: "market", 15: "wtb", 
                23: "grading", 36: "question", 38: "news", 39: "collecting"}

    # topic_id,tag_name
    tag_df = pd.read_csv('elitefourum-2024-06-08-topic-tag.csv')

    # Merge topic_df and embedding_df on id and topic_id
    merged_df = pd.merge(topic_df, embedding_df, left_on='id', right_on='topic_id')

    # Merge with tag_df to add tag information
    tagged_df = pd.merge(merged_df, tag_df, left_on='id', right_on='topic_id', how='left')

    # Group tags by topic_id and aggregate into a list
    tags_grouped = tagged_df.groupby('id')['tag_name'].apply(lambda x: list(x.dropna())).reset_index()

    # Merge the aggregated tags back into the main DataFrame
    df = pd.merge(merged_df, tags_grouped, on='id', how='left')

    # Rename the column for clarity
    df.rename(columns={'tag_name': 'tags'}, inplace=True)

    # Parse the embeddings into numpy arrays
    def parse_embedding(embedding_str):
        return np.array(eval(embedding_str))

    df['parsed_embeddings'] = df['embeddings'].apply(parse_embedding)

    df.to_pickle('processed_df.pkl')
    
    return df

def do_tsne(df, update=False, perplex=15, lrate=200):
    if not update and os.path.exists(f'tsne_p{perplex}_l{lrate}_df.pkl'):
        print("Loading existing processed tSNE DataFrame from pickle...")
        df = pd.read_pickle(f'tsne_p{perplex}_l{lrate}_df.pkl')
        return df
    
    # Create the embeddings array for t-SNE
    embeddings_array = np.stack(df['parsed_embeddings'].values)

    # Perform t-SNE
    tsne = TSNE(n_components=2, perplexity=perplex, random_state=42, init='random', learning_rate=lrate)
    vis_dims = tsne.fit_transform(embeddings_array)

    # Prepare data for plotting
    df['TSNE1'] = vis_dims[:, 0]
    df['TSNE2'] = vis_dims[:, 1]

    df.to_pickle(f'tsne_p{perplex}_l{lrate}_df.pkl')

    return df

df = get_df(update=False)
print(df)
df = do_tsne(df, update=False, perplex=15, lrate=50)

selected_columns = ['id', 'title', 'created_at', 'views', 'posts_count', 'user_id', 'like_count',
                    'category_id', 'slug', 'word_count', 'excerpt', 'topic_id', 'category', 'tags',
                    'TSNE1', 'TSNE2']

df_selected = df[selected_columns]


df_selected.to_csv('tsne.csv', index=False)

category_colors = {
    "collecting": "#a461ef",
    "articles": "#ed207b",
    "general": "#0088cc",
    "market": "#3ab54a",
    "wtb": "#ef2929",
    "grading": "#f7941d",
    "question": "#edd400",
    "news": "#12a89d"
}

fig = px.scatter(df, x='TSNE1', y='TSNE2', color='category',
                hover_data=['title', 'category', 'excerpt'],
                title='t-SNE of Thread Embeddings by Category',
                labels={'TSNE1': 't-SNE Component 1', 'TSNE2': 't-SNE Component 2'},
                color_discrete_map=category_colors)

fig.show()