import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookService } from './services/book.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  bookObj = new Book();
  bookList = signal<Book[]>([]);

  favObj = new Fav();
  favList = signal<Fav[]>([]);

  selectedFavouriteFilter = signal<string>("0");

  search = signal<string>("");

  selectedBookFav = signal<string>("")

  newFavName = signal<string>("")

  count = signal<number>(0);
  next= signal<string>("");
  previous= signal<string>("");
  currentPage= signal<number>(1);
  totalPages= signal<number>(0);

  goToPage(page: number): void {
    console.log(page,this.totalPages())
    if (page > 0 && page <= this.totalPages()) {
      this.loadBooks(this.selectedFavouriteFilter(),this.search(),page);
    }
  }

  constructor(private bookService: BookService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadBooks(this.selectedFavouriteFilter(),this.search(),this.currentPage());
    this.loadFav();
  }

  loadBooks(selectedfavourite: string, search: string, page: number): void {
    this.bookService.getBooks(selectedfavourite, search, page).subscribe((books) => {
      this.bookList.set(books?.results.map((book) => ({
        id: book.id ?? '',
        bookTitle: book.bookTitle,
        bookAuthor: book.bookAuthor,
        bookYear: book.bookYear,
        favId: book.favId,
      })));
      this.count.set(books.count);
      if (books.next) {
        this.next.set(books.next);
      } else {
        this.next.set("");
      }
      if (books.previous) {
        this.previous.set(books.previous);
      } else {
        this.previous.set("");
      }
      this.currentPage.set(page);
      this.totalPages.set(Math.ceil(this.count() / 10))
    });
  }

  loadFav(): void {
    this.bookService.getFav().subscribe((favs) => {
      this.favList.set(favs?.map((fav) => ({
        id: fav.id ?? '',
        name: fav.name,
      })));
    });
  }

  openBookModal(book?: Book): void {
    if (book) {
      this.bookObj = { ...book };
    } else {
      this.bookObj = new Book(); // Reset if adding a new book
    }

    const addBookModal = document.getElementById("addBook");
    if (addBookModal) {
      addBookModal.style.display = "block";
    }
  }

  closeBookModal(): void {
    const addBookModal = document.getElementById("addBook");
    if (addBookModal) {
      addBookModal.style.display = "none";
    }
    this.bookObj = new Book();
  }

  closeDeleteModal(): void {
    const closeDeleteModal = document.getElementById("deleteBook");
    if (closeDeleteModal) {
      closeDeleteModal.style.display = "none";
    }
    this.bookObj = new Book();
  }


  saveBook(): void {
    if (this.bookObj.id && this.bookObj.bookTitle && this.bookObj.bookAuthor && this.bookObj.bookYear) {
      this.bookService.updateBook(this.bookObj.id, this.bookObj).subscribe((value) => {
        if(value){
          this.loadBooks(this.selectedFavouriteFilter(),this.search(),this.currentPage());
          this.closeDeleteModal();
          this.showSuccessMessage('Book updated successfully!');
        }else{
          this.showErrorMessage('Something happend. Try again later!');
        }
      });
    } else {
      if (this.bookObj.bookTitle && this.bookObj.bookAuthor && this.bookObj.bookYear) {
        this.bookService.addBook(this.bookObj).subscribe((value) => {
          if(value){
            this.loadBooks(this.selectedFavouriteFilter(),this.search(),this.currentPage());
            this.closeBookModal();
            this.showSuccessMessage('Book added successfully!');
          }else{
            this.showErrorMessage('Something happend. Try again later!');
          }

        });
      }
    }
    this.closeBookModal();
  }

  deleteBookModal(book?: Book): void {
    if(book){
      this.bookObj = { ...book };
      const deleteBookModal = document.getElementById("deleteBook");
      if (deleteBookModal) {
        deleteBookModal.style.display = "block";
      }
    }
  }

  addFavBookModal(book?: Book): void {
    if(book){
      this.bookObj = { ...book };
      if(this.bookObj.favId == null){
        this.selectedBookFav.set("0");
      }
      else{
        this.selectedBookFav.set(book.favId);
      }
      const addBookFavModal = document.getElementById("addFavBook");
      if (addBookFavModal) {
        addBookFavModal.style.display = "block";
      }
    }
  }

  closeFavModal(): void {
    const closeFavModal = document.getElementById("addFavBook");
    if (closeFavModal) {
      closeFavModal.style.display = "none";
    }
    this.bookObj = new Book();
  }

  confirmBookDelete(): void {
    console.log(this.bookObj, this.bookObj.id,"delete clicked")
    if (this.bookObj.id) {
      this.bookService.deleteBook(this.bookObj.id).subscribe((value) => {
        if(value){
          this.loadBooks(this.selectedFavouriteFilter(),this.search(),this.currentPage());
          this.closeDeleteModal();
          this.showSuccessMessage('Book deleted successfully!');
        }else{
          this.showErrorMessage('Something happend. Try again later!');
        }
      });
      this.closeDeleteModal();
    }
  }

  onFavChange(event: any): void {
    this.loadBooks(event.target.value,this.search(),this.currentPage()); // Call with the selected filter
  }

  onSearch(event: any): void{
    this.loadBooks(this.selectedFavouriteFilter(),event.target.value,this.currentPage());
  }

  saveBookFav(): void {
    if (this.bookObj.id && this.selectedBookFav() != "0") {
      this.bookService.updateBookFav(this.bookObj.id, this.selectedBookFav())
      .subscribe((value) => {
        if(value){
          this.closeFavModal();
          this.loadBooks(this.selectedFavouriteFilter(),this.search(),this.currentPage());
          this.showSuccessMessage('Book Favourite added successfully!');
        }else{
          this.showErrorMessage('Something happend. Try again later!');
        }
      });
    }
    this.closeFavModal();
  }

  /////

  openFavListModal(): void {
    const closeFavModal = document.getElementById("favList");
    if (closeFavModal) {
      closeFavModal.style.display = "block";
    }
    this.favObj = new Fav();
  }

  closeFavListModal(): void {
    const closeFavModal = document.getElementById("favList");
    if (closeFavModal) {
      closeFavModal.style.display = "none";
    }
    this.favObj = new Fav();
  }

  favEdit(fav?: Fav): void {
    if(fav){
      this.favObj = { ...fav };
      const editFavModal = document.getElementById("editFav");
      if (editFavModal) {
        editFavModal.style.display = "block";
      }
    }
  }

  saveEditFav(): void {
    if (this.favObj.id) {
      this.bookService.updateFav(this.favObj.id, this.favObj)
      .subscribe((value) => {
        if(value){
          this.showSuccessMessage('Updated successfully!');
          this.loadFav();
        }else{
          this.showErrorMessage('Something happend. Try again later!');
        }
      });
    }
    this.closeEditfav();
  }

  closeEditfav(): void {
    const closeFavModal = document.getElementById("editFav");
    if (closeFavModal) {
      closeFavModal.style.display = "none";
    }
    this.favObj = new Fav();
  }


  // openFavDeleteModal(fav?: Fav): void {
  //   if(fav){
  //     this.favObj = { ...fav };
  //     const openFavDeleteModal = document.getElementById("deleteFav");
  //     if (openFavDeleteModal) {
  //       openFavDeleteModal.style.display = "block";
  //     }
  //   }
  // }

  // closeFavDeleteModal(): void {
  //   const closeFavDeleteModal = document.getElementById("deleteFav");
  //   if (closeFavDeleteModal) {
  //     closeFavDeleteModal.style.display = "none";
  //   }
  //   this.favObj = new Fav();
  // }

  confirmFavDelete(fav?: Fav): void {
    if(fav){
      this.favObj = { ...fav };
      if (this.favObj.id) {
        this.bookService.deleteFav(this.favObj.id).subscribe((value) => {
          if(value){
            this.showSuccessMessage('Favourite Deleted successfully!');
            this.loadFav();
            this.loadBooks(this.selectedFavouriteFilter(),this.search(),this.currentPage())
          }else{
            this.showErrorMessage('Something happend. Try again later!');
          }
        });
      }
    }
  }

  saveNewFav(): void{
    console.log("clicked",this.favObj)
    if (this.favObj.name) {
      this.bookService.addFav(this.favObj).subscribe((value) => {
        if(value){
          this.showSuccessMessage('Favourite Added successfully!');
          this.loadFav();
        }else{
          this.showErrorMessage('Something happend. Try again later!');
        }

      });
    }
  }

  private showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  private showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar'],
    });
  }



}

class Book {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  bookYear: string;
  favId: string;

  constructor() {
    this.id = "";
    this.bookTitle = "";
    this.bookAuthor = "";
    this.bookYear = "";
    this.favId = "";
  }
}

class Fav {
  id: string;
  name: string;

  constructor() {
    this.id = "";
    this.name = "";
  }
}

