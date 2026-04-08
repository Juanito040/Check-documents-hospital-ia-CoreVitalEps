"""
Servicio RAG (Retrieval-Augmented Generation)
Núcleo del sistema de consultas inteligentes
"""
import logging
import time
from typing import Dict, List, Optional

from app.services.ollama_service import ollama_service
from app.services.vector_store_service import vector_store_service

logger = logging.getLogger(__name__)


class RAGService:
    """Servicio para consultas usando arquitectura RAG"""

    def __init__(self):
        self.ollama = ollama_service
        self.vector_store = vector_store_service
        logger.info("RAGService inicializado")

    def query(
        self,
        question: str,
        category_filter: Optional[str] = None,
        top_k: int = None
    ) -> Dict:
        """
        Realizar consulta usando RAG

        Flujo:
        1. Vectorizar pregunta
        2. Buscar fragmentos relevantes en ChromaDB
        3. Construir prompt con contexto
        4. Generar respuesta con LLM
        5. Retornar respuesta con referencias

        Args:
            question: Pregunta del usuario
            category_filter: Filtro opcional por categoría de documentos
            top_k: Número de fragmentos a recuperar

        Returns:
            Dict con respuesta, fuentes y metadatos
        """
        start_time = time.time()

        try:
            # 1. Vectorizar pregunta
            logger.info(f"🔍 Consulta recibida: {question[:100]}...")
            query_embedding = self._vectorize_query(question)

            # 2. Buscar fragmentos relevantes
            metadata_filter = {"category": category_filter} if category_filter else None
            search_results = self._search_relevant_chunks(
                query_embedding,
                top_k=top_k,
                filter_metadata=metadata_filter
            )

            # 3. Verificar si se encontraron resultados
            if not search_results["documents"]:
                return self._no_results_response(question, time.time() - start_time)

            # Filtrar fragmentos con distancia semántica muy alta (poco relevantes)
            search_results = self._filter_by_distance(search_results, max_distance=0.75)

            if not search_results["documents"]:
                return self._no_results_response(question, time.time() - start_time)

            # 4. Construir contexto
            context = self._build_context(search_results)

            # 5. Generar respuesta con LLM
            answer = self._generate_answer(question, context)

            # 6. Preparar referencias
            sources = self._extract_sources(search_results)

            response_time = int((time.time() - start_time) * 1000)  # en milisegundos

            logger.info(f"✅ Respuesta generada en {response_time}ms")

            return {
                "answer": answer,
                "sources": sources,
                "chunks_used": len(search_results["documents"]),
                "response_time_ms": response_time,
                "category_filter": category_filter
            }

        except Exception as e:
            logger.error(f"❌ Error en consulta RAG: {e}")
            raise Exception(f"Error al procesar consulta: {str(e)}")

    def _vectorize_query(self, question: str) -> List[float]:
        """
        Paso 1: Convertir pregunta en vector usando modelo de embeddings
        """
        logger.info("📊 Vectorizando pregunta...")
        embedding = self.ollama.generate_embedding(question)
        return embedding

    def _search_relevant_chunks(
        self,
        query_embedding: List[float],
        top_k: Optional[int] = None,
        filter_metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Paso 2: Buscar fragmentos más relevantes por similitud semántica
        """
        logger.info(f"🔎 Buscando fragmentos relevantes (top_k={top_k})...")

        results = self.vector_store.similarity_search(
            query_embedding=query_embedding,
            top_k=top_k,
            filter_metadata=filter_metadata
        )

        logger.info(f"📚 Se encontraron {len(results['documents'])} fragmentos relevantes")
        return results

    def _build_context(self, search_results: Dict) -> str:
        """
        Paso 3: Construir contexto a partir de los fragmentos recuperados
        """
        context_parts = []

        for i, (doc, metadata) in enumerate(zip(
            search_results["documents"],
            search_results["metadatas"]
        ), 1):
            filename = metadata.get("filename", "Desconocido")
            category = metadata.get("category", "N/A")

            context_part = f"""
[Fragmento {i} - {filename} ({category})]
{doc}
"""
            context_parts.append(context_part)

        context = "\n".join(context_parts)
        logger.info(f"📝 Contexto construido: {len(context)} caracteres")

        return context

    def _generate_answer(self, question: str, context: str) -> str:
        """
        Paso 4: Generar respuesta usando el LLM con el contexto recuperado
        """
        logger.info("🤖 Generando respuesta con LLM...")

        answer = self.ollama.generate_response(
            prompt=question,
            context=context
        )

        return answer

    def _extract_sources(self, search_results: Dict) -> List[Dict]:
        """
        Paso 5: Extraer información de las fuentes utilizadas
        """
        sources = []
        seen_docs = set()

        for metadata in search_results["metadatas"]:
            doc_id = metadata.get("doc_id")
            filename = metadata.get("filename")

            # Evitar duplicados
            if doc_id not in seen_docs:
                sources.append({
                    "document_id": doc_id,
                    "filename": filename,
                    "category": metadata.get("category"),
                    "chunk_index": metadata.get("chunk_index")
                })
                seen_docs.add(doc_id)

        return sources

    def _filter_by_distance(self, search_results: Dict, max_distance: float = 0.75) -> Dict:
        """
        Filtrar fragmentos cuya distancia semántica supera el umbral.
        ChromaDB usa distancia coseno: 0 = idéntico, 2 = opuesto.
        Un valor > 0.75 generalmente indica fragmento irrelevante.
        """
        filtered = {"ids": [], "documents": [], "metadatas": [], "distances": []}

        for i, distance in enumerate(search_results["distances"]):
            if distance <= max_distance:
                filtered["ids"].append(search_results["ids"][i])
                filtered["documents"].append(search_results["documents"][i])
                filtered["metadatas"].append(search_results["metadatas"][i])
                filtered["distances"].append(distance)

        discarded = len(search_results["documents"]) - len(filtered["documents"])
        if discarded:
            logger.info(f"🔎 {discarded} fragmento(s) descartados por baja relevancia (distancia > {max_distance})")

        return filtered

    def _no_results_response(self, question: str, elapsed_time: float) -> Dict:
        """
        Respuesta cuando no se encuentran fragmentos relevantes
        """
        response_time = int(elapsed_time * 1000)

        logger.warning("⚠️ No se encontraron fragmentos relevantes")

        return {
            "answer": "No encontré información relevante sobre esa pregunta en los documentos indexados. "
                      "Por favor, reformula tu pregunta o verifica que existan documentos relacionados en el sistema.",
            "sources": [],
            "chunks_used": 0,
            "response_time_ms": response_time,
            "category_filter": None
        }


# Instancia global del servicio
rag_service = RAGService()
