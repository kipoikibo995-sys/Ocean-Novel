import React from "react";
import { useParams } from "react-router-dom";
import GlobalSearchComponent from "@/components/GlobalSearchComponent";

export default function GlobalSearchPage() {
  const { id = "1" } = useParams();

  return (
    <div className="flex-1 h-screen overflow-hidden flex flex-col bg-[#F4F1EA]">
      <GlobalSearchComponent projectId={id} isModal={false} />
    </div>
  );
}
