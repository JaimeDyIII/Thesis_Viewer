import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import '../../../styles/PDFViewer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs`;

const PDFViewer: React.FC<{ pdfUrl: string }> = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div className="pdf-viewer-container">
      <div
        className="pdf-document-wrapper"
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={(e) => e.button === 2 && e.preventDefault()}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          overflow: 'auto',
          height: '100%',
          width: '100%'
        }}
      >
        <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
          <Page 
            pageNumber={pageNumber} 
            scale={1.0} 
            className="pdf-page"
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
      {numPages && (
        <div className="pdf-controls">
          <button
            onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
            disabled={pageNumber === 1}
            className="pdf-button"
          >
            Previous
          </button>
          <span className="pdf-page-info">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
            disabled={pageNumber === numPages}
            className="pdf-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;