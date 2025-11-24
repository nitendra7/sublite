// Data export utilities for reports and analytics

const dataExporter = {
  // Export data to CSV format
  toCSV: (data, columns) => {
    if (!data || data.length === 0) {
      return '';
    }

    // Generate header row
    const headers = columns.map(col => col.header || col.key).join(',');
    
    // Generate data rows
    const rows = data.map(row => {
      return columns.map(col => {
        const value = row[col.key];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',');
    });

    return [headers, ...rows].join('\n');
  },

  // Export data to JSON format
  toJSON: (data) => {
    return JSON.stringify(data, null, 2);
  },

  // Export data to Excel-friendly format
  toExcel: (data, columns) => {
    // This would typically use a library like exceljs
    // For now, return CSV which Excel can open
    return dataExporter.toCSV(data, columns);
  },

  // Generate filename with timestamp
  generateFilename: (prefix, extension = 'csv') => {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${prefix}_${timestamp}.${extension}`;
  },

  // Format data for export based on type
  formatForExport: (data, type = 'csv') => {
    switch (type.toLowerCase()) {
      case 'json':
        return dataExporter.toJSON(data);
      case 'csv':
      case 'excel':
        return dataExporter.toCSV(data, Object.keys(data[0] || {}).map(key => ({ key, header: key })));
      default:
        return dataExporter.toJSON(data);
    }
  }
};

module.exports = dataExporter;
