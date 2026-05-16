export function getStudentData(data, student) {
  return (
    data?.[student.id] ??
    data?.[student.legacyKey] ??
    {}
  );
}