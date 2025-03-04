import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import ThesisTable from "../components/ThesisTable";
import AddThesisForm from "../components/AddThesisForm";
import { PlusIcon } from "lucide-react";
import { supabase } from "../config";

interface ThesisData {
  id: number;
  title: string;
  description: string;
  category: string;
  pdf_url?: string | null;
  isActive: boolean;
}

interface ThesisFormData {
  title: string;
  description: string;
  category: string;
  pdfFile?: File | null;
  isActive?: boolean;
}

const ManageThesis: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [theses, setTheses] = useState<ThesisData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTheses();
  }, []);

  const fetchTheses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("Thesis").select("*");

    if (error) {
      console.error("Error fetching theses:", error);
    } else {
      setTheses(data);
    }

    setLoading(false);
  };

  const handleAddThesis = async (newThesis: ThesisFormData) => {
    try {
      let pdfUrl: string | null = null;

      // Upload file if provided
      if (newThesis.pdfFile) {
        const fileExt = newThesis.pdfFile.name.split(".").pop();
        const fileName = `theses/${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("thesis_pdfs")
          .upload(fileName, newThesis.pdfFile, { upsert: true });

        if (error) throw error;
        pdfUrl = supabase.storage.from("thesis_pdfs").getPublicUrl(fileName).data.publicUrl;
      }

      // Insert thesis into Supabase DB
      const { data, error } = await supabase
        .from("Thesis")
        .insert([
          {
            title: newThesis.title,
            description: newThesis.description,
            category: newThesis.category,
            pdf_url: pdfUrl,
            isActive: newThesis.isActive ?? true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setTheses((prev) => [...prev, { ...data }]);
      setFormOpen(false);
    } catch (err) {
      console.error("Error adding thesis:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Manage Theses</h1>
          <Button
            onClick={() => setFormOpen(true)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
              boxShadow: 2,
              transition: "all 0.2s ease-in-out",
            }}
            variant="contained"
          >
            <PlusIcon size={18} />
            <span>Add New Thesis</span>
          </Button>
        </div>

        {/* ThesisTable now updates when a new thesis is added */}
        <ThesisTable theses={theses} loading={loading} />

        {/* Add Thesis Form */}
        <AddThesisForm open={formOpen} setOpen={setFormOpen} onSubmit={handleAddThesis} />
      </div>
    </div>
  );
};

export default ManageThesis;
