# Medical-chatbot-RAG-LangChain-pinecone

This medical chatbot is RAG based chat system build upon the medical knowledge base. The book Gale of Encyclopidia of Medicine Vol 1, is used as the knowledge base of the project. The following tech stack are used to build this project.

- Python and Flask - Development and REST APIs
- LangChain - Data orchestration
- Pinecone - Vector Database

Following LLMs were used in this project as the encoder and the decoder.

1. mistralai/Mistral-7B-Instruct-v0.2 has been used as the text reasoning LLM of the chatbot. It's an open source LLM inferenced by OpenAI.
2. sentence-transformers/all-MiniLM-L6-v2 is used as the vector embedding model.

Do the following steps to see the project.

### Clone the project
```bash
git clone https://github.com/AnushkaSamaranayake/Medical-chatbot-RAG-LangChain-pinecone.git
```

### Environment preparation

To prepare the environment, install the miniconda and create a virtual conda enviornment. Activate the environment and install the dependencies in the requirements.txt file
```bash
pip install -r requirements.txt
```

### Pinecone Index Creation

Create a Pinecone account first and then after installing dependencies, run the following file to create pinecone index.
```bash
python store_index.py
```

### Run the project

Now your Pineconde DB has stored the vectorized data as chunks successfully. To run the project, follow the steps below.

#### Run the frontend
```bash
cd frontend
```
```bash
npm install
```
```bash
npm run dev
```
Now the frontend is running on port 5432 (change this if you want another port). You can go to the link <link>http://localhost:5432</link> 

Next, run the backend.

#### Run the backend
```bash
cd ../
```
```bash
python app.py
```
Now you can see that the backend is running on port 5000. Send any medical related message to see the output. 
