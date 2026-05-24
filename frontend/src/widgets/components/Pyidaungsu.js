import jsPDF from "jspdf";
import pyidaungsuBase64 from "../../assets/wayPage/Pyidaungsu.ttf";

const loadPyidaungsu = () => {
  const doc = new jsPDF();
  doc.addFileToVFS("Pyidaungsu.ttf", pyidaungsuBase64);
  doc.addFont("Pyidaungsu.ttf", "Pyidaungsu", "normal");
};


loadPyidaungsu();
export default {};
