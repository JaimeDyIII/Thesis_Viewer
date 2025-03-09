import { IconButton } from "@mui/material";
import { Trash } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Props {
  thesisId: number;
  isActive: boolean;
  onUpdate: () => void;
}

const ToggleActiveButton: React.FC<Props> = ({ thesisId, isActive, onUpdate }) => {
  const toggleStatus = async () => {
    const { error } = await supabase
      .from("Thesis")
      .update({ isActive: !isActive })
      .eq("id", thesisId);

    if (error) {
      console.error("Error updating status:", error);
    } else {
      onUpdate(); 
    }
  };

  return (
    <IconButton
      onClick={toggleStatus}
      style={{ color: isActive ? "green" : "red" }}
    >
      <Trash size={20} />
    </IconButton>
  );
};

export default ToggleActiveButton;
export {}