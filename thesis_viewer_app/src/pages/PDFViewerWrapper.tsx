import { useLocation } from "react-router";
import PDFViewer from "../components/PDFViewer";

const PDFViewerWrapper = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const pdfUrl = params.get("url") || "";
  
    return pdfUrl ? <PDFViewer pdfUrl={pdfUrl} /> : <p>No PDF provided.</p>;
};

export default PDFViewerWrapper;