import { useParams } from "react-router-dom";

const PdfViewer = () => {
  const { pdfUrl } = useParams();

  return (
    <div style={{ width: "100%", height: "100vh", textAlign: "center" }}>
      <iframe
        src={`${decodeURIComponent(pdfUrl as string)}#toolbar=0`}
        width="100%"
        height="100%"
        style={{ border: "none" }}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default PdfViewer;