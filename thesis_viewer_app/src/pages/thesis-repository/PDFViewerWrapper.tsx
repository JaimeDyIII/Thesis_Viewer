import { useParams } from "react-router";
import PDFViewer from "../../components/ThesisRepository/ViewThesis/PDFViewer";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const PDFViewerWrapper = () => {
    const { title } = useParams<{ title: string }>();
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchPDFUrl = async () => {
            if (!title) return;

            const { data, error } = await supabase
                .from("Thesis")
                .select("pdf_url")
                .eq("title", decodeURIComponent(title))
                .single();

            if (error) {
                console.error("Error fetching PDF:", error);
                return;
            }
            
            setPdfUrl(data?.pdf_url || null);
        };

        fetchPDFUrl();
    }, [title]);

    return pdfUrl ? <PDFViewer pdfUrl={pdfUrl} /> : <p>PDF not found.</p>;
};

export default PDFViewerWrapper;
