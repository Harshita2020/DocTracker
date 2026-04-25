import { useEffect, useState } from "react";
import { fetchData, saveData } from "../api/dataApi";

export function useStudentData() {
  const [allData, setAllData] = useState({});

  // load once
  useEffect(() => {
    fetchData().then((data) => {
      if (data) setAllData(data);
    });
  }, []);

  // save on change
  useEffect(() => {
    if (Object.keys(allData).length === 0) return;
    saveData(allData);
  }, [allData]);

  return { allData, setAllData };
}