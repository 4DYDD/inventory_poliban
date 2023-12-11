-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 05, 2023 at 05:41 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `inventory--poliban`
--

-- --------------------------------------------------------

--
-- Table structure for table `barang`
--

CREATE TABLE `barang` (
  `id_barang` smallint(5) UNSIGNED ZEROFILL NOT NULL,
  `nama_barang` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `kategori_barang` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `jumlah_barang` int UNSIGNED NOT NULL DEFAULT '0',
  `dipinjam` int DEFAULT '0',
  `gambar_barang` varchar(255) COLLATE utf8mb4_general_ci DEFAULT 'https://emojipedia.id/wp-content/uploads/2020/03/Emoji-Matahari-dengan-Wajah-WhatsApp.png'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `barang`
--

INSERT INTO `barang` (`id_barang`, `nama_barang`, `kategori_barang`, `jumlah_barang`, `dipinjam`, `gambar_barang`) VALUES
(09118, 'Axioo', 'AIO', 22, 0, 'https://4dydd.github.io/footage/axioo.png'),
(09119, 'HP', 'PC', 21, 0, 'https://i5.walmartimages.com/asr/a782e048-bb0e-4ad4-8e29-15eacc5e926b_1.99cbe42f0d808d9c0261abceebcacfc9.jpeg?odnHeight=450&odnWidth=450&odnBg=ffffff'),
(09120, 'HP', 'Laptop', 23, 0, 'https://store.hp.com/UKStore/Html/Merch/Images/c05456657_1750x1285.jpg'),
(09121, 'Asus', 'PC', 28, 0, 'https://gadgetsquad.id/wp-content/uploads/2019/06/PC-desktop-ASUS-PRO-D340MC-768x432.png');

-- --------------------------------------------------------

--
-- Table structure for table `data_mahasiswa`
--

CREATE TABLE `data_mahasiswa` (
  `nim_mahasiswa` bigint NOT NULL,
  `nama_mahasiswa` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `jenkel_mahasiswa` enum('kosong','laki-laki','perempuan') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'kosong',
  `alamat_mahasiswa` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email_mahasiswa` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nh_mahasiswa` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `data_mahasiswa`
--

INSERT INTO `data_mahasiswa` (`nim_mahasiswa`, `nama_mahasiswa`, `jenkel_mahasiswa`, `alamat_mahasiswa`, `email_mahasiswa`, `nh_mahasiswa`) VALUES
(654339, 'Adit Dayak', 'laki-laki', 'Grand Purnama 1, Kelurahan Handil Bakti, Kecamatan Alalak, Jln Trans Kalimantan', 'adeeettt16@gmail.com', '082321110058'),
(654341, 'Lana React', 'laki-laki', 'Berangas', 'udin15@gmail.com', '081934587783'),
(654342, 'Qori Lanciau', 'laki-laki', 'Semangat Dalam', 'qokasetor18@gmail.com', '087753728050'),
(654344, 'Aan Dayak', 'laki-laki', 'Kampung Melayu', 'aan19@gmail.com', '089542104520'),
(654346, 'Rafi Pray', 'laki-laki', 'dimana ja', 'rafi17@gmail.com', '085249103637'),
(654347, 'Nazwa', 'perempuan', 'tidak diketahui', 'awa20@gmail.com', '082155292979');

-- --------------------------------------------------------

--
-- Table structure for table `info_peminjaman`
--

CREATE TABLE `info_peminjaman` (
  `id_peminjaman` smallint(5) UNSIGNED ZEROFILL NOT NULL,
  `tanggal_meminjam` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tanggal_mengembalikan` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_barang` smallint(5) UNSIGNED ZEROFILL NOT NULL,
  `barang_dipinjam` int UNSIGNED DEFAULT '0',
  `nim_mahasiswa` bigint NOT NULL,
  `status` enum('meminjam','dipinjamkan','mengembalikan','diterima') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id_pengguna` bigint UNSIGNED NOT NULL,
  `email_mahasiswa` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nim_mahasiswa` bigint DEFAULT NULL,
  `kode_admin` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password_admin` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id_pengguna`, `email_mahasiswa`, `nim_mahasiswa`, `kode_admin`, `password_admin`) VALUES
(91301283, NULL, NULL, 'adminpoltekjaya', 'adminpoltekjamping123'),
(91301284, 'adeeettt16@gmail.com', 654339, NULL, NULL),
(91301286, 'udin15@gmail.com', 654341, NULL, NULL),
(91301287, 'qokasetor18@gmail.com', 654342, NULL, NULL),
(91301289, 'aan19@gmail.com', 654344, NULL, NULL),
(91301291, 'rafi17@gmail.com', 654346, NULL, NULL),
(91301292, 'awa20@gmail.com', 654347, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `barang`
--
ALTER TABLE `barang`
  ADD PRIMARY KEY (`id_barang`);

--
-- Indexes for table `data_mahasiswa`
--
ALTER TABLE `data_mahasiswa`
  ADD PRIMARY KEY (`nim_mahasiswa`),
  ADD UNIQUE KEY `email_mahasiswa` (`email_mahasiswa`),
  ADD UNIQUE KEY `nh_mahasiswa` (`nh_mahasiswa`);

--
-- Indexes for table `info_peminjaman`
--
ALTER TABLE `info_peminjaman`
  ADD PRIMARY KEY (`id_peminjaman`),
  ADD KEY `id_barang` (`id_barang`),
  ADD KEY `id_barang_2` (`id_barang`),
  ADD KEY `nim_mahasiswa_4` (`nim_mahasiswa`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_pengguna`),
  ADD UNIQUE KEY `nim_mahasiswa_2` (`nim_mahasiswa`),
  ADD UNIQUE KEY `email_mahasiswa_2` (`email_mahasiswa`),
  ADD UNIQUE KEY `kode_admin` (`kode_admin`),
  ADD UNIQUE KEY `password_admin` (`password_admin`),
  ADD KEY `email_mahasiswa` (`email_mahasiswa`),
  ADD KEY `nim_mahasiswa` (`nim_mahasiswa`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `barang`
--
ALTER TABLE `barang`
  MODIFY `id_barang` smallint(5) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9122;

--
-- AUTO_INCREMENT for table `data_mahasiswa`
--
ALTER TABLE `data_mahasiswa`
  MODIFY `nim_mahasiswa` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=654348;

--
-- AUTO_INCREMENT for table `info_peminjaman`
--
ALTER TABLE `info_peminjaman`
  MODIFY `id_peminjaman` smallint(5) UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8491;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id_pengguna` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91301293;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `info_peminjaman`
--
ALTER TABLE `info_peminjaman`
  ADD CONSTRAINT `info_peminjaman_ibfk_1` FOREIGN KEY (`id_barang`) REFERENCES `barang` (`id_barang`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `info_peminjaman_ibfk_2` FOREIGN KEY (`nim_mahasiswa`) REFERENCES `data_mahasiswa` (`nim_mahasiswa`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`nim_mahasiswa`) REFERENCES `data_mahasiswa` (`nim_mahasiswa`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_ibfk_2` FOREIGN KEY (`email_mahasiswa`) REFERENCES `data_mahasiswa` (`email_mahasiswa`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
