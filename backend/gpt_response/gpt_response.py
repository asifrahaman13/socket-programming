import os
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
from langchain.llms import OpenAI
from langchain.vectorstores import Chroma
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.chains import RetrievalQA
from langchain.vectorstores import Chroma
import time

# Load environment variables from .env file
load_dotenv()
api_key = os.environ["OPEN_AI_KEY"]


def evvahealt_query(question):
    # # start_time = time.time()
    # OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", api_key)
    # embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    # loader = PyPDFLoader(f"pdf_data/evva.pdf")
    # data = loader.load()
    # text_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)
    # texts = text_splitter.split_documents(data)

    # docsearch = Chroma.from_documents(texts, embeddings)
    # chain = RetrievalQA.from_chain_type(
    #     llm=OpenAI(temperature=0, openai_api_key=OPENAI_API_KEY, max_tokens=700),
    #     chain_type="stuff",
    #     retriever=docsearch.as_retriever(
    #         search_type="similarity", search_kwargs={"k": 5}
    #     ),
    # )
    # # query = "The document contains the repository along with the codes. Now you need to decide which Repository contains the most complex code. Tell the name of the repository. Also explain in 100 words why you think the repository is the most complex"
    # query = f"""You are an expert who is is supposes to answer the customers usign the specific knowledgebase. use the knowledgebase about Evva health document provided. Now answer according to the question.

    # The question is as follows:

    # {question}
    # """
    # # Run the first query.
    # response = chain.run(query)
    time.sleep(1)

    response = """Based on the provided text,"""

    print(response)

    return response
