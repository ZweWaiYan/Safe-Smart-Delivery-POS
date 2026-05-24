import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../widgets/components/Pyidaungsu";

export const handleExportPdf = ({ filteredList }) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  doc.setFont("Pyidaungsu");  // ✅ same name
  doc.setFontSize(16);
  doc.text("လမ်းစာရင်း (Way List Report)", 14, 15);

  const tableColumn = ["No", "Outlet", "Customer", "Package Fee", "Deli Fee", "Phone", "Address"];

  const tableRows = filteredList.map((item, index) => [
    index + 1,
    item.Outlet?.outletName || "",
    item.Customer?.customerName || "",
    item.itemPrice || 0,
    0,
    item.Customer?.customerPhone || "",
    item.Customer?.customerAddress || "",
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    styles: { font: "Pyidaungsu", fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [22, 160, 133] },
  });

  doc.save("way-list.pdf");
};
