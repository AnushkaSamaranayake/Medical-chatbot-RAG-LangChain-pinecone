from src.helper import load_pdf_file, filter_to_minimal_docs, text_split, download_embedding
from dotenv import load_dotenv
import os
from pinecone import Pinecone
from pinecone import ServerlessSpec
from langchain_pinecone import PineconeVectorStore

load_dotenv()

# Load data from pdf files
extracted_data = load_pdf_file("data")

#filter necessary the data
minimal_doc = filter_to_minimal_docs(extracted_data)

# Chunking the data
text_chunks = text_split(minimal_doc)

# Download embedding model
embeddings = download_embedding()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
HF_TOKEN = os.getenv("HF_TOKEN")

#setting as environment variables
os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY
os.environ["HF_TOKEN"] = HF_TOKEN


pinecone_api_key = PINECONE_API_KEY
pc = Pinecone(api_key=pinecone_api_key)

# Create Pinecone index
index_name = "medibot"

if not pc.has_index(index_name):
    pc.create_index(
        name = index_name,
        dimension=384, # vector dimension for all-MiniLM-L6-v2
        metric="cosine", # similarity metric cosine
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )
index = pc.Index(index_name)

docsearch = PineconeVectorStore.from_documents(
    documents=text_chunks,
    embedding=embeddings,
    index_name=index_name
)