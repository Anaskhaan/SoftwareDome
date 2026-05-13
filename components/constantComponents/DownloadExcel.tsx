import React from 'react';
import { Icons } from '../../assets/icons';

const DownloadExcel = ({ tableData, tableHeaders }: { tableData: any, tableHeaders: any }) => {
  const handleDownload = () => {
    console.log("Downloading excel...", { tableData, tableHeaders });
    alert("Excel download triggered (Mock)");
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
    >
      <Icons.ArrowDown size={16} />
      Export Excel
    </button>
  );
};

export default DownloadExcel;
