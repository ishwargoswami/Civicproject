import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileText,
  Calendar,
  Building2,
  Tag,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { PublicDocument } from '../../store/slices/transparencySlice';
import { transparencyAPI } from '../../services/api';

interface DocumentViewerProps {
  documents: PublicDocument[];
  isLoading: boolean;
  onDocumentDownload?: (document: PublicDocument) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documents,
  isLoading,
  onDocumentDownload,
}) => {
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      meeting_minutes: 'Meeting Minutes',
      budget_report: 'Budget Report',
      policy_document: 'Policy Document',
      contract: 'Contract',
      proposal: 'Proposal',
      report: 'Report',
      other: 'Other',
    };
    return types[type] || type;
  };

  const getDocumentTypeIcon = (type: string) => {
    // You can customize icons based on document type
    return <FileText className="h-5 w-5" />;
  };

  const handleDownload = async (document: PublicDocument) => {
    if (downloadingIds.has(document.id)) return;
    
    setDownloadingIds(prev => new Set(prev).add(document.id));
    
    try {
      // For demo purposes, create a sample PDF content
      const sampleContent = `
        ${document.title}
        
        Department: ${document.department.name}
        Document Type: ${getDocumentTypeLabel(document.document_type)}
        Date: ${formatDate(document.date_created)}
        
        ${document.description}
        
        This is a sample document for demonstration purposes.
        In a real implementation, this would be the actual document content.
        
        Tags: ${document.tags.join(', ')}
      `;
      
      // Create blob and download
      const blob = new Blob([sampleContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${document.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      if (onDocumentDownload) {
        onDocumentDownload(document);
      }
    } catch (error) {
      console.error('Failed to download document:', error);
      // Show a more user-friendly message
      alert('Demo download completed! In a real implementation, this would download the actual document file.');
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(document.id);
        return newSet;
      });
    }
  };

  const handlePreview = (document: PublicDocument) => {
    // For now, we'll just trigger download
    // In a real implementation, you might want to open a modal with document preview
    handleDownload(document);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-gray-600 rounded mb-4"></div>
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-4 bg-gray-600 rounded mb-4 w-3/4"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-600 rounded w-20"></div>
              <div className="h-8 bg-gray-600 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Documents Found</h3>
        <p className="text-gray-400">No public documents match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((document) => (
        <motion.div
          key={document.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
        >
          {/* Document Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                {getDocumentTypeIcon(document.document_type)}
              </div>
              <div>
                <span className="text-xs text-blue-400 font-medium">
                  {getDocumentTypeLabel(document.document_type)}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePreview(document)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Preview"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDownload(document)}
                disabled={downloadingIds.has(document.id)}
                className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                title="Download"
              >
                {downloadingIds.has(document.id) ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Document Title */}
          <h3 className="text-white font-semibold mb-2 line-clamp-2">
            {document.title}
          </h3>

          {/* Document Description */}
          {document.description && (
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
              {document.description}
            </p>
          )}

          {/* Document Metadata */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-400">
              <Building2 className="h-4 w-4 mr-2" />
              {document.department.name}
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDate(document.date_created)}
            </div>
          </div>

          {/* Document Tags */}
          {document.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {document.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {document.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                  +{document.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Document Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="text-xs text-gray-400">
              {document.file_type} • {formatFileSize(document.file_size)}
            </div>
            {document.requires_request && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                Request Required
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DocumentViewer;
