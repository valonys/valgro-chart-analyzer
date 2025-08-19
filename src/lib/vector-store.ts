import { Document } from '@/types/chart-analysis';

// Simple TF-IDF implementation for document similarity
export class VectorStore {
  private documents: Document[] = [];
  private vocabulary: Set<string> = new Set();
  
  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }
  
  private calculateTfIdf(tokens: string[], document: string[], allDocuments: string[][]): number[] {
    const tf: { [key: string]: number } = {};
    const docLength = tokens.length;
    
    // Calculate term frequency
    tokens.forEach(token => {
      tf[token] = (tf[token] || 0) + 1;
    });
    
    // Convert to TF-IDF vector
    return Array.from(this.vocabulary).map(term => {
      const termFreq = (tf[term] || 0) / docLength;
      const docFreq = allDocuments.filter(doc => doc.includes(term)).length;
      const idf = Math.log(allDocuments.length / (docFreq + 1));
      return termFreq * idf;
    });
  }
  
  private cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  addDocument(document: Document): void {
    const tokens = this.tokenize(document.content);
    tokens.forEach(token => this.vocabulary.add(token));
    
    // Recalculate vectors for all documents
    const allTokens = this.documents.concat(document).map(doc => this.tokenize(doc.content));
    
    this.documents.forEach((doc, index) => {
      doc.vector = this.calculateTfIdf(allTokens[index], allTokens[index], allTokens);
    });
    
    document.vector = this.calculateTfIdf(tokens, tokens, allTokens);
    this.documents.push(document);
  }
  
  searchSimilar(query: string, topK: number = 5): Document[] {
    if (this.documents.length === 0) return [];
    
    const queryTokens = this.tokenize(query);
    const allTokens = this.documents.map(doc => this.tokenize(doc.content));
    const queryVector = this.calculateTfIdf(queryTokens, queryTokens, allTokens);
    
    const similarities = this.documents.map(doc => ({
      document: doc,
      similarity: this.cosineSimilarity(queryVector, doc.vector || [])
    }));
    
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .filter(item => item.similarity > 0.1)
      .map(item => item.document);
  }
  
  getAllDocuments(): Document[] {
    return [...this.documents];
  }
  
  clear(): void {
    this.documents = [];
    this.vocabulary.clear();
  }
}

export const vectorStore = new VectorStore();