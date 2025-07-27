function clearTextInput() {
  document.getElementById('textInput').value = "";
}

function clearFileInput() {
  document.getElementById('pdfInput').value = "";
}

function generateFlashcards() {
  const fileInput = document.getElementById('pdfInput');
  const textInput = document.getElementById('textInput').value.trim();

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }
    extractTextFromPDF(file);
  } else if (textInput.length > 0) {
    createFlashcards(textInput);
  } else {
    alert("Please upload a PDF or paste some text.");
  }
}

function extractTextFromPDF(file) {
  const reader = new FileReader();
  reader.onload = function () {
    const typedarray = new Uint8Array(this.result);

    pdfjsLib.getDocument(typedarray).promise.then(pdf => {
      let totalText = "";

      const loadPages = async () => {
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(" ");
          totalText += pageText + " ";
        }
        createFlashcards(totalText);
      };

      loadPages();
    });
  };

  reader.readAsArrayBuffer(file);
}

function createFlashcards(text) {
  const container = document.getElementById('flashcards');
  container.innerHTML = "";

  // Normalize and split into paragraphs or logical blocks
  const cleanedText = text.replace(/\s+/g, ' ').trim();
  const rawChunks = cleanedText.split(/(?<=[.?!])\s+(?=[A-Z])/g); // Better than just '.'

  // Filter relevant ones: remove short lines, duplicates
  const filtered = Array.from(new Set(rawChunks))
    .map(s => s.trim())
    .filter(s => s.length > 60)
    .slice(0, 10); // Limit to 10 flashcards

  if (filtered.length === 0) {
    container.innerHTML = "<p>No clear content found to generate flashcards.</p>";
    return;
  }

  filtered.forEach((chunk, i) => {
    const card = document.createElement('div');
    card.className = "flashcard";

    const title = document.createElement('div');
    title.className = "flashcard-title";
    title.innerText = `🔹 Key Point ${i + 1}`;

    const summary = document.createElement('div');
    summary.className = "flashcard-summary";
    summary.innerText = chunk;

    card.appendChild(title);
    card.appendChild(summary);
    container.appendChild(card);
  });

  document.getElementById('mainContainer').classList.add('split-mode');
  document.getElementById('flashcardSection').style.display = "block";
}


function backToEditor() {
  document.getElementById('mainContainer').classList.remove('split-mode');
  document.getElementById('flashcardSection').style.display = "none";
  document.getElementById('flashcards').innerHTML = "";
}
