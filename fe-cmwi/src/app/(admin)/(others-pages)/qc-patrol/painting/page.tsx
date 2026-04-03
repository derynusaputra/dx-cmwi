import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import { Metadata } from "next";
import React from "react";
import TablePainting from "../_component/TablePainting";

export const metadata: Metadata = {
  title: " Basic Table | QCPandawara ",
  description:
    "This is  Basic Table  page for QCPandawara  ",
  // other metadata
};

export default function Painting() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Painting" />
      <div className="space-y-6">
        {/* <ComponentCard title="Painting"> */}
          <TablePainting />
        {/* </ComponentCard> */}
      </div>
    </div>
  );
}
