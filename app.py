from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_pinecone import PineconeVectorStore
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
import os
from src.helper import download_embedding
from src.prompt import *


app = Flask(__name__)
CORS(app)

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
HF_TOKEN = os.getenv("HF_TOKEN")

#setting as environment variables
os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY
os.environ["HF_TOKEN"] = HF_TOKEN

# Download embedding model
embeddings = download_embedding()
index_name = "medibot"

# Load existing index
docsearch = PineconeVectorStore.from_existing_index(
    index_name=index_name,
    embedding=embeddings
)


# Connect the retriever
retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k":3})
chatModel = ChatOpenAI(
    model="mistralai/Mistral-7B-Instruct-v0.2:featherless-ai",
    openai_api_base="https://router.huggingface.co/v1",
    openai_api_key=HF_TOKEN,
    temperature=0
)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}")
    ]
)

question_answer_chain = create_stuff_documents_chain(chatModel, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)


@app.route("/")
def home():
    return "backend is running"

@app.route("/chat", methods=["GET","POST"])
def chat():
    msg = request.json.get("message")
    input = {"input": msg}
    print("Input question:", input)
    response = rag_chain.invoke(input)
    answer = response["answer"]
    print("answer:", answer)
    return jsonify({"answer": answer})


# @app.route("/chat", methods=["GET","POST"])
# def chat():

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
