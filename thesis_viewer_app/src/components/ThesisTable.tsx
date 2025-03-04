import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from "@mui/material";

interface ThesisData {
  id: number;
  title: string;
  description: string;
  category: string;
  pdf_url?: string | null;
  isActive: boolean;
}

interface ThesisTableProps {
  theses: ThesisData[]; // Accept theses as a prop
  loading: boolean; // Accept loading state
}

const ThesisTable: React.FC<ThesisTableProps> = ({ theses, loading }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>PDF</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : theses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No theses found.
              </TableCell>
            </TableRow>
          ) : (
            theses.map((thesis) => (
              <TableRow key={thesis.id}>
                <TableCell>{thesis.title}</TableCell>
                <TableCell>{thesis.description}</TableCell>
                <TableCell>{thesis.category}</TableCell>
                <TableCell>
                  {thesis.pdf_url ? (
                    <a href={thesis.pdf_url} target="_blank" rel="noopener noreferrer">
                      View PDF
                    </a>
                  ) : (
                    "No PDF"
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ThesisTable;
