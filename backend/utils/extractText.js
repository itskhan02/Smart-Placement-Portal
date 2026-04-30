const pdfParse = require("pdf-parse");
const fs = require("fs");
const mammoth = require("mammoth");

exports.extractText = async (filePath, mimeType) => {
  try {
    console.log("Extracting text from:", filePath);
    console.log("MIME type:", mimeType);

    if (mimeType === "application/pdf") {
      const buffer = fs.readFileSync(filePath);
      console.log("PDF buffer size:", buffer.length);

      const data = await pdfParse(buffer);
      console.log("PDF text extracted, length:", data.text?.length || 0);

      if (!data.text || data.text.trim().length < 10) {
        console.warn(
          "WARNING: Very little text extracted from PDF. File may be image-based or empty.",
        );
      }

      return data.text || "";
    }

    if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      console.log("DOCX text extracted, length:", result.value?.length || 0);

      if (!result.value || result.value.trim().length < 10) {
        console.warn(
          "WARNING: Very little text extracted from DOCX. File may be empty.",
        );
      }

      return result.value || "";
    }

    if (mimeType === "text/plain") {
      const text = fs.readFileSync(filePath, "utf-8");
      console.log("TXT text extracted, length:", text?.length || 0);
      return text || "";
    }

    console.warn("Unsupported MIME type:", mimeType);
    return "";
  } catch (err) {
    console.error("Text extraction error:", err);
    return "";
  }
};
