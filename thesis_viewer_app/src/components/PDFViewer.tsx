import { useEffect } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

const PDFViewer: React.FC<{ pdfUrl: string }> = ({ pdfUrl }) => {
  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
      <div 
        onContextMenu={(e) => e.preventDefault()} 
        onMouseDown={(e) => e.button === 2 && e.preventDefault()} 
        style={{ width: '100%', height: '100%' }}
      >
        <Viewer fileUrl={pdfUrl} defaultScale={1.0} />
      </div>
    </Worker>
  );
};

export default PDFViewer;
