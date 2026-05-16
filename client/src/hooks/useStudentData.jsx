import { useEffect, useState } from "react";
import { fetchData, saveData } from "../api/dataApi";

export function useStudentData() {
  const [allData, setAllData] = useState({});

  // load once
  useEffect(() => {
    console.time("fetchData");
    fetchData().then((data) => {
      if (data) setAllData(data);
      console.timeEnd("fetchData");
      console.log("Result-", data);
      console.log("Result keys-", Object.keys(data));
    });
  }, []);

  // save on change
  useEffect(() => {
    if (Object.keys(allData).length === 0) return;
    saveData(allData);
  }, [allData]);

  return { allData, setAllData };
}