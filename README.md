MABAR.CU adalah aplikasi pencarian teman bermain game (gaming matchmaking platform) yang dikembangkan sebagai proyek akhir mata kuliah Pemrograman Berorientasi Objek (PBO). Aplikasi ini membantu pemain menemukan teman mabar berdasarkan game, rank, role, dan preferensi bermain, sekaligus menyediakan fitur komunikasi dan manajemen room secara realtime.

👥 Anggota Kelompok:
Affan Afyga
Rendy Januarta
Michel Garcia Arteta Ginting
Juan Carlos Simanungkalit

📖 Deskripsi Proyek
MABAR.CU dirancang untuk mempermudah pemain dalam mencari teman bermain yang sesuai dengan kebutuhan mereka. Pengguna dapat membuat akun, mencari pemain lain, mengikuti pengguna, membuat room matchmaking, bergabung ke room, melakukan chat, dan mengelola profil pribadi.
Aplikasi ini menerapkan konsep Pemrograman Berorientasi Objek (PBO) secara menyeluruh dengan arsitektur yang terstruktur dan modern.

🛠️ Teknologi yang Digunakan
• Frontend
JavaFX
FXML
CSS JavaFX

• Backend
Spring Boot
Spring MVC
Spring Security
Spring Validation

• Database
H2 Database
ORM
JPA (Java Persistence API)
Hibernate
Build Tools
Maven
Bahasa Pemrograman
Java 17

🏗️ Arsitektur Sistem
Proyek ini menggunakan pola:
MVC Architecture

Model
│
├── Entity
├── Repository
│
Service
│
Controller
│
View (JavaFX)
Struktur ini memisahkan:
Tampilan (View)
Logika Bisnis (Service)
Pengelolaan Data (Repository)
Kontrol Aplikasi (Controller)
agar kode lebih mudah dikembangkan dan dipelihara.

🗄️ Database
Aplikasi menggunakan H2 Database sebagai database utama untuk menyimpan:
Data User
Profil User
Friend List
Matchmaking Room
Chat
Tournament
Riwayat Aktivitas

🔒 Keamanan Sistem
Keamanan aplikasi diimplementasikan menggunakan:
Authentication (Login)
Authorization (Role User & Admin)
Password Encryption
Session Management
Input Validation

📚 Implementasi 4 Pilar PBO

1. Encapsulation
Data pada setiap class disimpan menggunakan atribut private dan diakses melalui getter serta setter.
Contoh:
private String username;

public String getUsername() {
    return username;
}

2. Inheritance
Class tertentu mewarisi atribut dan perilaku dari class induk.
Contoh:
public class Admin extends User

3. Polymorphism
Method yang sama dapat memiliki implementasi berbeda sesuai objek yang digunakan.
Contoh:
public void displayProfile()

4. Abstraction
Menggunakan abstract class dan interface untuk menyembunyikan detail implementasi.
Contoh:
public interface UserService

🎯 Tujuan Proyek
Menerapkan konsep Pemrograman Berorientasi Objek secara nyata.
Mengimplementasikan JavaFX dan Spring Boot dalam satu aplikasi.
Membangun sistem matchmaking pemain yang modern dan mudah digunakan.
Memenuhi seluruh kriteria teknis proyek akhir mata kuliah PBO.

🚀 Cara Menjalankan
Backend
mvn spring-boot:run
Backend berjalan pada:
http://localhost:8085
Frontend JavaFX
mvn javafx:run

📌 Hasil yang Diharapkan
Dengan MABAR.CU, pengguna dapat menemukan teman bermain yang sesuai, berkomunikasi dengan pemain lain, serta mengelola aktivitas gaming mereka dalam satu platform yang terintegrasi.
