let currentEditBookId = null;

// Mendapatkan daftar buku dari localStorage
function getBooks() {
  return JSON.parse(localStorage.getItem('books')) || [];
}

// Menyimpan daftar buku ke localStorage
function saveBooks(books) {
  localStorage.setItem('books', JSON.stringify(books));
}

// Merender daftar buku
function renderBooks() {
  const books = getBooks();
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');
  
  // Bersihkan daftar buku sebelum dirender ulang
  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  // Render ulang buku ke halaman
  books.forEach(book => {
    const bookElement = document.createElement('div');
    bookElement.setAttribute('data-bookid', book.id);
    bookElement.setAttribute('data-testid', 'bookItem');

    bookElement.innerHTML = `
      <h3 data-testid="bookItemTitle">${book.title}</h3>
      <p data-testid="bookItemAuthor">${book.author}</p>
      <p data-testid="bookItemYear">${book.year}</p>
      <div>
        <button data-testid="bookItemIsCompleteButton">${book.isComplete ? 'Belum Selesai Dibaca' : 'Selesai Dibaca'}</button>
        <button data-testid="bookItemEditButton">Edit</button>
        <button data-testid="bookItemDeleteButton">Hapus</button>
      </div>
    `;

    // Add event listener untuk button selesai/belum selesai dibaca
    const toggleCompleteButton = bookElement.querySelector('[data-testid="bookItemIsCompleteButton"]');
    toggleCompleteButton.addEventListener('click', function () {
      toggleCompleteStatus(book.id);
    });

    // Add event listener untuk button edit
    const editButton = bookElement.querySelector('[data-testid="bookItemEditButton"]');
    editButton.addEventListener('click', function () {
      openEditModal(book.id);
    });

    // Add event listener untuk button hapus
    const deleteButton = bookElement.querySelector('[data-testid="bookItemDeleteButton"]');
    deleteButton.addEventListener('click', function () {
      deleteBook(book.id);
    });

    // Masukkan buku ke rak yang sesuai (selesai/belum selesai dibaca)
    if (book.isComplete) {
      completeBookList.appendChild(bookElement);
    } else {
      incompleteBookList.appendChild(bookElement);
    }
  });
}

// Menambah buku baru
function addBook(title, author, year, isComplete) {
  const books = getBooks();

  const newBook = {
    id: +new Date(),
    title,
    author,
    year: Number(year),
    isComplete
  };

  books.push(newBook);
  saveBooks(books);
  renderBooks();
}

// Menghapus buku
function deleteBook(id) {
  let books = getBooks();
  books = books.filter(book => book.id !== id);
  saveBooks(books);
  renderBooks();
}

// Mengubah status selesai/belum selesai dibaca
function toggleCompleteStatus(id) {
  const books = getBooks();
  const bookIndex = books.findIndex(book => book.id === id);
  books[bookIndex].isComplete = !books[bookIndex].isComplete;
  saveBooks(books);
  renderBooks();
}

// Membuka modal edit buku
function openEditModal(id) {
  const books = getBooks();
  const bookToEdit = books.find(book => book.id === id);
  
  // Set data buku di form edit
  document.getElementById('editBookFormTitle').value = bookToEdit.title;
  document.getElementById('editBookFormAuthor').value = bookToEdit.author;
  document.getElementById('editBookFormYear').value = bookToEdit.year;
  document.getElementById('editBookFormIsComplete').checked = bookToEdit.isComplete;

  // Set currentEditBookId untuk digunakan saat menyimpan
  currentEditBookId = id;

  document.getElementById('editBookModal').classList.add('show');
}

// Menutup modal edit
function closeEditModal() {
  document.getElementById('editBookModal').classList.remove('show');
}

// Menyimpan perubahan buku yang diedit
function saveEditedBook() {
  const books = getBooks();
  const bookIndex = books.findIndex(book => book.id === currentEditBookId);

  // Update data buku yang diedit dengan data input baru
  books[bookIndex].title = document.getElementById('editBookFormTitle').value;
  books[bookIndex].author = document.getElementById('editBookFormAuthor').value;
  books[bookIndex].year = Number(document.getElementById('editBookFormYear').value);
  books[bookIndex].isComplete = document.getElementById('editBookFormIsComplete').checked;

  // Simpan perubahan ke localStorage
  saveBooks(books);
  
  // Render ulang daftar buku
  renderBooks();

  closeEditModal();
}

// Form tambah buku baru
document.getElementById('bookForm').addEventListener('submit', function (e) {
  e.preventDefault();
  addBook(
    document.getElementById('bookFormTitle').value,
    document.getElementById('bookFormAuthor').value,
    Number(document.getElementById('bookFormYear').value),
    document.getElementById('bookFormIsComplete').checked
  );
  
  // Reset form setelah submit
  this.reset();
});

// Form edit buku
document.getElementById('editBookForm').addEventListener('submit', function (e) {
  e.preventDefault();
  saveEditedBook();
});

// Menampilkan hasil pencarian
function renderSearchResults(searchQuery) {
  const books = getBooks();
  const searchResults = document.getElementById('searchResults');

  // Bersihkan hasil pencarian sebelum menampilkan hasil baru
  searchResults.innerHTML = '';

  // Filter buku berdasarkan judul yang dicari
  const filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (filteredBooks.length === 0) {
    searchResults.innerHTML = '<p>Tidak ada buku yang ditemukan.</p>';
  } else {
    filteredBooks.forEach(book => {
      const bookElement = document.createElement('div');
      bookElement.setAttribute('data-bookid', book.id);

      bookElement.innerHTML = `
        <h3 data-testid="bookItemTitle">${book.title}</h3>
        <p data-testid="bookItemAuthor">${book.author}</p>
        <p data-testid="bookItemYear">${book.year}</p>
      `;

      searchResults.appendChild(bookElement);
    });
  }
}

// Event listener untuk form pencarian
document.getElementById('searchBook').addEventListener('submit', function (e) {
  e.preventDefault();
  const searchQuery = document.getElementById('searchBookTitle').value;
  renderSearchResults(searchQuery);
  this.reset();
});

// Fungsi untuk memastikan data yang ada di localStorage juga dikonversi
function convertExistingData() {
  const books = getBooks();
  const convertedBooks = books.map(book => ({
    ...book,
    year: Number(book.year)
  }));
  saveBooks(convertedBooks);
}

// Bersihkan hasil pencarian ketika halaman di-reload dan konversi data yang ada
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('searchResults').innerHTML = '';
  convertExistingData();
  renderBooks();
});

// Tutup modal ketika tombol close diklik
document.getElementById('closeModal').addEventListener('click', closeEditModal);