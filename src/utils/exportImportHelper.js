export const exportData = () => {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    // Only export JSON parsable data to avoid breaking formats
    try {
      data[key] = JSON.parse(value);
    } catch {
      data[key] = value;
    }
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `L2-student-progress-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = (file, onSuccess) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (typeof data === "object" && data !== null) {
        Object.keys(data).forEach((key) => {
          localStorage.setItem(key, JSON.stringify(data[key]));
        });
        if (onSuccess) onSuccess();
      } else {
        alert("Invalid file format.");
      }
    } catch (err) {
      alert("Error parsing JSON file.");
    }
  };
  reader.readAsText(file);
};
