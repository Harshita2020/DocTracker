export function getFieldData(studentData, field) {
  return (
    studentData?.[field.id] ??
    studentData?.[field.label] ??
    false
  );
}

export function normalizeField(fieldData) {
  if (typeof fieldData === "boolean") {
    return {
      hasDoc: fieldData,
      value: "",
    };
  }

  return (
    fieldData ?? {
      hasDoc: false,
      value: "",
    }
  );
}