
export function isValidObjectId(idString) {
  // Check if the provided string matches the ObjectId pattern
  const isValidString = /^[0-9a-fA-F]{24}$/.test(idString);

  if (!isValidString) {
    return false; // Not a valid ObjectId candidate
  }

  // Use the MongoDB ObjectId.isValid method to check if it's a valid ObjectId
  return true;
}

