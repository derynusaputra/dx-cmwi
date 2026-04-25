import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import TableQCR from "./_component/TableQCR";

export const metadata: Metadata = {
  title: "QCR | Dashboard",
  description: "Quality Control Request — Dashboard",
};

export default function QCRAdminPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Quality Control Request" />
      <div className="space-y-6">
        <TableQCR />
      </div>
    </div>
  );
}
