from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
import os
from typing import List, Dict, Any
import os
from dotenv import load_dotenv
import json
load_dotenv()

class GroqRAGSystem:
    def __init__(
        self,
        groq_api_key: str,
        qdrant_api_key: str,
        qdrant_url: str = os.getenv("QDRANT_URL"),
        model_name: str = "llama-3.3-70b-versatile",
        embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2",
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
        collection_name: str = "data",
        template: str = """You are a helpful AI assistant. Use the following pieces of context to answer the question at the end. 
            Also keep the answer concise and to the point.
            If asked about quantity just answer the quantity.
            If you don't know the answer, just say you don't know. Don't try to make up an answer.
            
            Context: {context}
            
            Question: {question}
            
            Answer: Let me help you with that. """
    ):
        """
        Initialize the RAG system with Groq and Qdrant.
        
        Args:
            groq_api_key: Your Groq API key
            qdrant_api_key: Your Qdrant API key
            qdrant_url: Qdrant instance URL
            model_name: Groq model to use
            embedding_model: HuggingFace model for embeddings
            chunk_size: Size of text chunks
            chunk_overlap: Overlap between chunks
            collection_name: Name of the Qdrant collection
        """
        # Set up Groq
        self.llm = ChatGroq(
            api_key=groq_api_key,
            model_name=model_name,
            temperature=0.7,
            max_tokens=1024
        )
        
        # Set up embeddings
        self.embeddings = HuggingFaceEmbeddings(model_name=embedding_model)
        
        # Set up text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len
        )
        
        # Set up Qdrant
        self.vector_store = QdrantVectorStore.from_existing_collection(
            collection_name=collection_name,
            url=qdrant_url,
            api_key=qdrant_api_key,
            embedding=self.embeddings
        )
        
        # Set up RAG prompt
        self.rag_prompt = PromptTemplate(
            template=template,
            input_variables=["context", "question"]
        )

    def add_documents(self, documents: List[str], metadatas: List[Dict[str, Any]] = None):
        """
        Add documents to the vector store.
        
        Args:
            documents: List of document texts
            metadatas: Optional list of metadata dictionaries for each document
        """
        # Split documents
        texts = []
        for doc in documents:
            texts.extend(self.text_splitter.split_text(doc))
        
        # Handle optional metadata
        if metadatas and len(metadatas) != len(documents):
            raise ValueError("Metadata length must match the number of  documents.")
        
        # Add to Qdrant
        self.vector_store.add_texts(
            texts,
            metadatas=metadatas if metadatas else None
        )
    def add_inventory(self, inventory: List[Dict[str, Any]]):
        """
        Add inventory items to the Qdrant collection.
        
        Args:
            inventory: List of inventory items in dictionary format.
            Example: {"product_name": "Laptop", "description": "Powerful gaming laptop", "quantity": 10, "price": 1200.99}
        """
        # Extract text-based descriptions for embeddings
        texts = [f"file_name = {item['file_name']} - content={item.get('content', '')} - repo_name={item.get('repo_name','')} - last_modified_by={item.get('last_modified_by','')}" for item in inventory]

        
        # Store full item details as metadata
        self.vector_store.add_texts(texts, metadatas=inventory)
        print("files added successfully.")

    def get_inventory(self, query: str, k_documents: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieve inventory items based on a query.
        
        Args:
            query: The query to search for (e.g., product name or description).
            k_documents: The number of relevant inventory items to retrieve.
        
        Returns:
            A list of dictionaries with the matching inventory items.
        """
        results = self.vector_store.similarity_search(query, k=k_documents)
        
        # Extract metadata instead of raw text
        inventory_items = [doc.metadata for doc in results if doc.metadata]
        
        return inventory_items

    def update_inventory(self, product_name, updated_data):
        # Perform a search using the correct parameters
        search_type = "similarity"  # Replace this with the correct search type if needed
        results = self.vector_store.search(product_name, search_type=search_type, limit=1)  # Use `limit` instead of `top_k`

        if results:
            # Get the first matching document
            doc = results[0]
            doc_id = doc.metadata.get('_id')  # Extract the document ID
            if not doc_id:
                print(f"Document for {product_name} does not have a valid ID.")
                return

            # Delete the existing document
            try:
                self.vector_store.delete(ids=[doc_id])  # Delete by ID
                print(f"Deleted old inventory for {product_name}.")
            except Exception as e:
                print(f"Error deleting old inventory for {product_name}: {e}")
                return

            # Add the updated document
            try:
                self.add_inventory([updated_data]) # Add updated data
                print(f"Updated inventory for {product_name}.")
            except Exception as e:
                print(f"Error updating inventory for {product_name}: {e}")
        else:
            print(f"Product {product_name} not found.")



    def delete_inventory(self, product_name: str):
        """
        Delete an inventory item from the Qdrant collection.
        
        Args:
            product_name: The name of the product to delete.
        """
        # Retrieve the relevant inventory items
        query = f"product_name:{product_name}"
        results = self.vector_store.similarity_search(query, k=1)  # Fetch one result matching the product_name
        print(results)
        if results:
            doc = results[0]
            # Remove the document from Qdrant
            _id = doc.metadata.get('_id')
            if _id:
                print(f"Document ID: {_id}")
            else:
                print("No `_id` found in document metadata.")
            _ids = [doc.metadata.get('_id') for doc in results if '_id' in doc.metadata]
            self.vector_store.delete(ids=_ids)  # Delete by document ID
            print(f"Deleted inventory for {product_name}.")
        else:
            print(f"Product {product_name} not found.")

    def query(
        self,
        question: str,
        k_documents: int = 4
    ) -> Dict[str, Any]:
        """
        Query the RAG system.
        
        Args:
            question: User's question
            k_documents: Number of documents to retrieve
            
        Returns:
            Dictionary containing answer and relevant context
        """
        # Retrieve relevant documents
        results = self.vector_store.similarity_search(
            question,
            k=k_documents
        )
        
        if not results:

            return {
                "answer": "No relevant information found.",
                "context": []
            }
        
        # Create QA chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.vector_store.as_retriever(),
            chain_type_kwargs={"prompt": self.rag_prompt},
            return_source_documents=True
        )
        
        # Get answer
        result = qa_chain.invoke({"query": question})
        
        return {
            "answer": result["result"],
            "context": [doc.page_content for doc in results]
        }


# Example usage
# if __name__ == "__main__":
#     # Initialize the system
#     rag_system = GroqRAGSystem(
#         groq_api_key=os.getenv("GROQ_API_KEY"),
#         qdrant_api_key=os.getenv("QDRANT_API_KEY")
#     )
    
#     # Example documents
#     documents = [
#         """LangChain is a framework for developing applications powered by language models.
#         It provides many tools and integrations for working with language models.""",
        
#         """Groq is a new AI infrastructure company that provides fast inference for
#         large language models. Their GroqChip is designed for ML acceleration.""",
        
#         """Qdrant is a vector database for building AI applications with embeddings.
#         It's designed to be fast, scalable, and easy to use."""
#     ]
    
#     # Add documents
#     rag_system.add_documents(documents)
    
#     # Example query
#     result = rag_system.query(
#         "What is LangChain and how does it relate to language models?",
#         k_documents=2
#     )
    
#     print("Answer:", result["answer"])
#     print("\nRelevant Context:")
#     for i, context in enumerate(result["context"]):
#         print(f"\nDocument {i+1}:")
#         print(context)
